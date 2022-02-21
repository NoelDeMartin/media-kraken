import { SolidModel, SolidHasManyRelation } from 'soukai-solid';
import { urlRoute } from '@noeldemartin/utils';
import Soukai, { FieldType, MultiModelRelation } from 'soukai';

import Str from '@/utils/Str';
import TMDBMoviesParser from '@/utils/parsers/TMDBMoviesParser';
import TMDBResolver from '@/utils/media/TMDBResolver';
import Url from '@/utils/Url';
import UUID from '@/utils/UUID';

import TheMovieDBApi, { TMDBMovie } from '@/api/TheMovieDBApi';

import WatchAction from '@/models/soukai/WatchAction';

export default class Movie extends SolidModel {

    public static rdfContexts = {
        'schema': 'https://schema.org/',
    };

    public static rdfsClasses = ['schema:Movie'];

    public static fields = {
        title: {
            type: FieldType.String,
            rdfProperty: 'schema:name',
            required: true,
        },
        description: {
            type: FieldType.String,
            rdfProperty: 'schema:description',
        },
        releaseDate: {
            type: FieldType.Date,
            rdfProperty: 'schema:datePublished',
        },
        posterUrl: {
            type: FieldType.String,
            rdfProperty: 'schema:image',
        },
        externalUrls: {
            type: FieldType.Array,
            rdfProperty: 'schema:sameAs',
            items: { type: FieldType.String },
        },
    };

    public title!: string;
    public description?: string;
    public releaseDate?: Date;
    public posterUrl?: string;
    public externalUrls!: string[];
    public createdAt!: Date;
    public updatedAt!: Date;

    public actions?: WatchAction[];
    public relatedActions!: SolidHasManyRelation<Movie, WatchAction, typeof WatchAction>;

    public get watched(): boolean {
        return !!this.actions && this.actions.length > 0;
    }

    public get pending(): boolean {
        return !this.watched;
    }

    public get watchedAt(): Date | null {
        return this.watched ? this.actions![0].createdAt : null;
    }

    public get uuid(): string | null {
        if (!this.url)
            return null;

        return this.url.match(/([^/#]+)(#.*)?$/)[1] ?? null;
    }

    public get slug(): string {
        let slug = Str.slug(this.title);

        if (this.releaseDate?.getFullYear())
            slug += '-' + this.releaseDate.getFullYear();

        return slug;
    }

    public get imdbUrl(): string | null {
        return this.externalUrls.find(url => url.includes('imdb.com')) || null;
    }

    public get tmdbUrl(): string | null {
        return this.externalUrls.find(url => url.includes('themoviedb.org')) || null;
    }

    public get imdbId(): string | null {
        if (!this.imdbUrl)
            return null;

        const matches = this.imdbUrl.match(/https:\/\/www\.imdb\.com\/title\/([^/]+)/);

        return matches ? matches[1] : null;
    }

    public get tmdbId(): number | null {
        if (!this.tmdbUrl)
            return null;

        const matches = this.tmdbUrl.match(/https:\/\/www\.themoviedb\.org\/movie\/(\d+)/);

        return matches ? parseInt(matches[1]) : null;
    }

    public is(movie: Movie): boolean {
        return this.slug === movie.slug
            || !!this.externalUrls.find(url => movie.externalUrls.includes(url));
    }

    // TODO remove when this is fixed in soukai-solid.
    public getSourceDocumentUrl(): string | null {
        const originalSourceDocumentUrl = super.getSourceDocumentUrl();

        return originalSourceDocumentUrl
            ? urlRoute(originalSourceDocumentUrl)
            : null;
    }

    public actionsRelationship(): MultiModelRelation {
        return this
            .hasMany(WatchAction, 'object')
            .usingSameDocument()
            .onDelete('cascade');
    }

    public async fetchMissingAttributes(): Promise<void> {
        if (this.imdbId && this.tmdbId)
            return;

        const tmdbMovie = await this.resolveTMDBMovie();

        if (!tmdbMovie)
            return;

        const movie = await TMDBMoviesParser.parse(tmdbMovie);

        this.setAttributes(movie.getAttributes());
        this.regenerateUrls();
    }

    public async watch(date?: Date): Promise<WatchAction> {
        date = date || new Date();

        return this.relatedActions.create({ startTime: date, endTime: date });
    }

    public hasLegacySchema(): boolean {
        if (!this.exists() || this.wasRecentlyCreated())
            return false;

        const documentUrl = this.getDocumentUrl();
        const sourceDocumentUrl = this.getSourceDocumentUrl();

        return (documentUrl !== null && sourceDocumentUrl !== null && documentUrl !== sourceDocumentUrl)
            || !this.url.includes('#');
    }

    public async migrateSchema(): Promise<void> {
        if (!this.exists() || this.wasRecentlyCreated())
            return;

        const sourceDocumentUrl = this.getSourceDocumentUrl()!;
        const resourceHash = Url.parse(this.url)?.fragment ?? this.modelClass.defaultResourceHash;
        const fixedUrl = `${sourceDocumentUrl}#${resourceHash}`;

        const legacyActions = this.relatedActions.getLoadedModels().filter(
            action => action.getSourceDocumentUrl() === sourceDocumentUrl,
        );
        const fixedActionUrls = legacyActions.reduce(
            (fixedActionUrls, action) => {
                const actionResourceHash = Url.parse(action.url)?.fragment ?? UUID.generate();

                fixedActionUrls[action.url] = `${sourceDocumentUrl}#${actionResourceHash}`;

                return fixedActionUrls;
            },
            {} as Record<string, string>,
        );

        await Soukai.requireEngine().update(
            this.getSourceContainerUrl()!,
            this.getSourceDocumentUrl()!,
            {
                '@graph': {
                    $updateItems: [
                        {
                            $where: { '@id': this.url },
                            $update: { '@id': fixedUrl },
                        },
                        ...legacyActions.map(action => ({
                            $where: { '@id': action.url },
                            $update: {
                                '@id': fixedActionUrls[action.url],
                                'https://schema.org/object': { '@id': fixedUrl },
                            },
                        })),
                    ],
                },
            },
        );

        this.fixLegacyAttributes(fixedUrl);
        legacyActions.forEach(action => action.fixLegacyAttributes(fixedActionUrls[action.url], fixedUrl));
    }

    protected newUrl(documentUrl?: string, resourceHash?: string): string {
        documentUrl = documentUrl ?? Url.resolve(this.modelClass.collection, this.slug);
        resourceHash = resourceHash ?? this.modelClass.defaultResourceHash;

        return `${documentUrl}#${resourceHash}`;
    }

    private async resolveTMDBMovie(): Promise<TMDBMovie | null> {
        if (this.tmdbId)
            return TheMovieDBApi.getMovie(this.tmdbId);

        if (this.imdbId) {
            const model = await TMDBResolver.resolveImdbId(this.imdbId);

            if (model === null || !TheMovieDBApi.isMovie(model))
                return null;

            model.imdb_id = this.imdbId;

            return model;
        }

        return null;
    }

    private regenerateUrls(): void {
        if (!this.url || this.exists() || !this.isDocumentRoot())
            return;

        const documentActions = (this.actions || [])
            .filter(action => action.url && action.url.startsWith(this.url));

        this.mintUrl();
        documentActions.forEach(action => action.mintUrl(this.url));
    }

    private fixLegacyAttributes(url: string): void {
        this._attributes.url = url;
    }

}
