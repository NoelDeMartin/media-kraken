import Soukai, { MultiModelRelation, FieldType, SoukaiError, Attributes } from 'soukai';
import { NetworkError, SolidContainerModel, SolidContainsRelation } from 'soukai-solid';

import Arr from '@/utils/Arr';
import Movie from '@/models/soukai/Movie';
import SolidAuth from '@/authentication/SolidAuth';

export default class MediaContainer extends SolidContainerModel {

    public static fields = {
        name: {
            type: FieldType.String,
            rdfProperty: 'rdfs:label',
            required: true,
        },
        description: {
            type: FieldType.String,
            rdfProperty: 'rdfs:comment',
        },
    };

    public movies?: Movie[];
    public relatedMovies!: SolidContainsRelation<MediaContainer, Movie, typeof Movie>;

    private fixedUpdatedAt: Date | null = null;

    public moviesRelationship(): MultiModelRelation {
        return this.contains(Movie);
    }

    public async hasLegacySchema(): Promise<boolean> {
        return this.exists() && !this.wasRecentlyCreated() && !this.name;
    }

    public async migrateSchema(name: string, describedBy?: string): Promise<void> {
        if (!this.exists() || this.wasRecentlyCreated())
            return;

        const metaDocumentUrl = describedBy || `${this.url}.meta`;
        const createdAt = await this.getCreatedAtFromMetaDocument(metaDocumentUrl);

        try {
            const response = await SolidAuth.fetch(metaDocumentUrl, {
                method: 'PUT',
                headers: { 'Content-Type': 'text/turtle' },
                body: [
                    '@prefix movies: <./> .',
                    '@prefix purl: <http://purl.org/dc/terms/> .',
                    '@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .',
                    '',
                    'movies:',
                    `    purl:created ${this.serializeTurtleDate(createdAt)} ;`,
                    `    rdfs:label "${name}" .`,
                ].join('\n'),
            });

            if (response.status !== 201)
                throw new SoukaiError(`Error migrating ${this.url}, returned ${response.status} status code`);

            this.fixLegacyAttributes(name, this.fixedUpdatedAt || this.updatedAt);
        } catch (error) {
            throw new NetworkError(`Error migrating ${this.url}`, error);
        }
    }

    protected initializeAttributes(attributes: Attributes, exists: boolean): void {
        if (exists && 'updatedAt' in attributes && Array.isArray(attributes['updatedAt']))
            this.fixedUpdatedAt = attributes['updatedAt'].slice(1).reduce(
                (latest, current) => latest > current ? latest : current,
                attributes['updatedAt'][0],
            );

        super.initializeAttributes(attributes, exists);
    }

    private async getCreatedAtFromMetaDocument(metaDocumentUrl: string): Promise<Date> {
        const document = await Soukai.requireEngine().readOne(this.getContainerUrl()!, metaDocumentUrl);

        if (!this.isLegacyMetaDocument(document))
            throw new SoukaiError(
                `The document at ${metaDocumentUrl} was not created with Media Kraken so it isn't safe to migrate, ` +
                'you can migrate it yourself by adding rdfs:label property',
            );

        return new Date(document['@graph'][0]['http://purl.org/dc/terms/created']['@value']);
    }

    private isLegacyMetaDocument(document: any): document is {
        '@graph': [{
            'http://purl.org/dc/terms/created': { '@value': string };
        }];
    } {
        if (document['@graph'].length > 1)
            return false;

        const containerResource = document['@graph'][0];
        const properties = Object.keys(containerResource);
        const expectedProperties = [
            '@id',
            '@type',
            'http://purl.org/dc/terms/created',
            'http://purl.org/dc/terms/modified',
            'http://www.w3.org/2000/01/rdf-schema#label',
        ];

        return properties.length !== expectedProperties.length
            || expectedProperties.some(property => !properties.includes(property))
            || Arr.create(containerResource['@type']).some((type: string) => ![
                'https://www.w3.org/ns/ldp#Resource',
                'https://www.w3.org/ns/ldp#Container',
            ].includes(type));
    }

    private fixLegacyAttributes(name: string, updatedAt: Date): void {
        this._attributes.name = name;
        this._attributes.updatedAt = updatedAt;
    }

    private serializeTurtleDate(value: Date): string {
        const digits = (...numbers: number[]) => numbers.map(number => number.toString().padStart(2, '0'));
        const date = digits(value.getUTCFullYear(), value.getUTCMonth() + 1, value.getUTCDate()).join('-');
        const time = digits(value.getUTCHours(), value.getUTCMinutes(), value.getUTCSeconds()).join(':');

        return `"${date}T${time}Z"^^<http://www.w3.org/2001/XMLSchema#dateTime>`;
    }

}
