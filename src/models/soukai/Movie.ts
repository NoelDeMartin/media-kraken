import { FieldType, Model } from 'soukai';
import { SolidModel, SolidEmbedsRelation } from 'soukai-solid';

import Arr from '@/utils/Arr';
import Obj from '@/utils/Obj';
import Str from '@/utils/Str';
import TMDBMoviesParser from '@/utils/parsers/TMDBMoviesParser';
import Url from '@/utils/Url';

import TheMovieDBApi, { TMDBMovie } from '@/api/TheMovieDBApi';

import WatchAction from '@/models/soukai/WatchAction';

export interface MovieJSON {
    title: string;
    description?: string;
    releaseDate?: string;
    posterUrl?: string;
    watchedAt?: string;
    externalUrls?: string[];
}

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

    public actions?: WatchAction[];

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

    public actionsRelationship(): SolidEmbedsRelation<Movie, WatchAction, typeof WatchAction> {
        return this.embeds(WatchAction) as any;
    }

    public async save<T extends Model>(containerUrl?: string): Promise<T> {
        const result = await super.save<T>(containerUrl);

        if (this.isRelationLoaded('actions'))
            await Promise.all(this.actions!.map(action => this.actionsRelationship().save(action)));

        return result;
    }

    public async completeAttributes(): Promise<void> {
        if (this.imdbId && this.tmdbId)
            return;

        const tmdbMovie = await this.resolveTMDBMovie();

        if (!tmdbMovie)
            return;

        const newAttributes = TMDBMoviesParser.parse(tmdbMovie).getAttributes();

        // TODO implement model.setAttributes(...); in soukai
        for (const [key, value] of Object.entries(newAttributes)) {
            this.setAttribute(key, value);
        }
    }

    public async watch(date?: Date | string): Promise<WatchAction> {
        // TODO implement model.mintUrl() in soukai-solid (or do it in constructor)
        if (!this.hasAttribute(Movie.primaryKey))
            this.setAttribute(Movie.primaryKey, this.newUrl());

        const action = new WatchAction({ object: this.url });

        if (date)
            action.createdAt = date;

        try {
            // TODO maybe this should be handled by soukai...
            if (this.isRelationLoaded('actions'))
                this.setRelationModels('actions', [...this.actions!, action]);

            if (!this.exists())
                return action;

            await this.actionsRelationship().save(action);

            return action;
        } catch (e) {
            if (this.isRelationLoaded('actions'))
                this.setRelationModels('actions', Arr.withoutItem(this.actions!, action));

            throw e;
        }
    }

    public toJSON(): MovieJSON {
        return Obj.withoutUndefined({
            title: this.title,
            description: this.description,
            releaseDate: this.releaseDate?.toString(),
            posterUrl: this.posterUrl,
            watchedAt: this.watchedAt?.toString(),
            externalUrls: this.externalUrls,
        });
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

}
