import { SolidContainerModel, SolidContainsRelation, SolidEngine, SolidEngineListener } from 'soukai-solid';
import Soukai, { MultiModelRelation, FieldType } from 'soukai';

import Movie from '@/models/soukai/Movie';

export default class MediaContainer extends SolidContainerModel {

    public static fields = {
        name: {
            type: FieldType.String,
            rdfProperty: 'rdfs:label',
            required: true,
        },
    };

    public movies?: Movie[];
    public relatedMovies!: SolidContainsRelation<MediaContainer, Movie, typeof Movie>;

    private legacyUrl: string | null = null;

    public moviesRelationship(): MultiModelRelation {
        return this.contains(Movie);
    }

    public async hasLegacySchema(): Promise<boolean> {
        if (!this.exists() || this.wasRecentlyCreated())
            return false;

        // This is the date when v0.2.0 was released with the schema migration.
        // In order to to avoid doing an unnecessary request to get the meta document,
        // we are assuming that containers with updatedAt later than this date are already up to date.
        const schemaMigrationReleaseDate = new Date(); // TODO update on 0.2.0 release
        const oldestModification = this.modificationDates ? this.modificationDates.sort()[0] : new Date(0);

        if (oldestModification > schemaMigrationReleaseDate)
            return false;

        return this.hasLegacyUrl();
    }

    public async migrateSchema(): Promise<void> {
        if (!this.exists() || this.wasRecentlyCreated())
            return;

        const updatedAt = new Date();

        await Soukai.requireEngine().update(
            this.getContainerUrl()!,
            this.getDocumentUrl()! + '.meta',
            {
                '@graph': {
                    $updateItems: {
                        $where: { '@id': this.legacyUrl },
                        $update: {
                            '@id': this.url,
                            'http://purl.org/dc/terms/modified': {
                                '@type': 'http://www.w3.org/2001/XMLSchema#dateTime',
                                '@value': updatedAt.toISOString(),
                            },
                        },
                    },
                },
            },
        );

        this.legacyUrl = null;
        this.fixLegacyAttributes(updatedAt);
    }

    private async hasLegacyUrl(): Promise<boolean> {
        this.legacyUrl = await this.getLegacyUrl();

        return this.legacyUrl !== null;
    }

    private async getLegacyUrl(): Promise<string | null> {
        let containsRelativeIRIs: boolean = false;
        const engine = Soukai.requireEngine() as SolidEngine;
        const listener: SolidEngineListener = {
            onRDFDocumentLoaded: (_, metadata) => containsRelativeIRIs = !!metadata.containsRelativeIRIs,
        };

        engine.addListener(listener);

        const metaDocument = await engine.readOne(this.getContainerUrl()!, this.url + '.meta');

        engine.removeListener(listener);

        return containsRelativeIRIs ? null : (metaDocument as any)['@graph'][0]['@id'];
    }

    private fixLegacyAttributes(updatedAt: Date): void {
        this._attributes.updatedAt = updatedAt;
    }

}
