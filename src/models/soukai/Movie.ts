import { FieldType, MultiModelRelation } from 'soukai';
import { SolidModel, SolidHasManyRelation } from 'soukai-solid';

import Arr from '@/utils/Arr';
import Obj from '@/utils/Obj';
import Str from '@/utils/Str';
import TMDBMoviesParser from '@/utils/parsers/TMDBMoviesParser';
import Url from '@/utils/Url';

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
        return this.url
            ? this.url.substring(this.url.lastIndexOf('/') + 1)
            : null;
    }

    public get slug(): string {
        let slug = Str.slug(this.title);

        if (this.releaseDate?.getFullYear())
            slug += '-' + this.releaseDate.getFullYear();

        return slug;
    }

    public get imdbUrl(): string | null {
        return this.externalUrls.find(url => Str.contains(url, 'imdb.com')) || null;
    }

    public get tmdbUrl(): string | null {
        return this.externalUrls.find(url => Str.contains(url, 'themoviedb.org')) || null;
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
            || !!this.externalUrls.find(url => Arr.contains(movie.externalUrls, url));
    }

    public actionsRelationship(): MultiModelRelation {
        return this.hasMany(WatchAction, 'object');
    }

    public async fetchMissingAttributes(): Promise<void> {
        if (this.imdbId && this.tmdbId)
            return;

        const tmdbMovie = await this.resolveTMDBMovie();

        if (!tmdbMovie)
            return;

        const newMovie = await TMDBMoviesParser.parse(tmdbMovie);
        const newAttributes = newMovie.getAttributes();

        // TODO implement model.setAttributes(...); in soukai
        for (const [key, value] of Object.entries(newAttributes)) {
            this.setAttribute(key, value);
        }

        this.regenerateUrls();
    }

    public watch(date?: Date): Promise<WatchAction> {
        return this.relatedActions.create(Obj.withoutUndefined({ createdAt: date }), true);
    }

    protected newUrl(): string {
        return Url.resolve(this.classDef.collection, this.slug);
    }

    private async resolveTMDBMovie(): Promise<TMDBMovie | null> {
        if (this.tmdbId)
            return TheMovieDBApi.getMovie(this.tmdbId);

        if (this.imdbId) {
            const { movie_results } = await TheMovieDBApi.find(
                this.imdbId,
                { external_source: 'imdb_id' },
            );

            if (!movie_results || movie_results.length === 0)
                return null;

            movie_results[0].imdb_id = this.imdbId;

            return movie_results[0];
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

}
