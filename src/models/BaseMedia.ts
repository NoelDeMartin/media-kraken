import { isTruthy } from '@noeldemartin/utils';
import { RelationNotLoaded } from 'soukai-bis';
import type { BelongsToManyRelation, HasOneRelation } from 'soukai-bis';

import { countryCodeFromUrl } from '@/lib/countries';
import { findExternalId } from '@/lib/domains';
import { genreKeysFromUrls, type GenreKey } from '@/lib/genres';
import { parseImdbId } from '@/lib/imdb';

import Model from './BaseMedia.schema';
import type Note from './Note';
import type PerformanceRole from './PerformanceRole';
import { normalizeRating } from './Rating';
import type Review from './Review';

export default class BaseMedia extends Model {
    declare public readonly cast?: PerformanceRole[];
    declare public readonly relatedCast: BelongsToManyRelation<this, PerformanceRole, typeof PerformanceRole>;
    declare public readonly review?: Review;
    declare public readonly relatedReview: HasOneRelation<this, Review, typeof Review>;
    declare public readonly note?: Note;
    declare public readonly relatedNote: HasOneRelation<this, Note, typeof Note>;

    public get slug(): string {
        return this.requireSlug();
    }

    public get imdbId(): string | null {
        return findExternalId('https://www.imdb.com/title/', this.externalUrls, parseImdbId);
    }

    public get genreKeys(): GenreKey[] {
        return genreKeysFromUrls(this.genreUrls);
    }

    public get countryCodes(): string[] {
        return this.countryUrls.map(countryCodeFromUrl).filter(isTruthy);
    }

    public get rating(): number | null {
        return this.review?.rating?.ratingValue ?? null;
    }

    public get notes(): string | null {
        return this.note?.text ?? null;
    }

    public setRating(rating: number | null): void {
        this.assertRelationLoaded('review');

        if (rating === null) {
            this.review?.relatedRating.detach({ delete: true });
            this.relatedReview.detach({ delete: true });

            return;
        }

        const ratingAttributes = { ratingValue: normalizeRating(rating) };
        const review = this.review ?? this.relatedReview.attach({}, { mintUrl: true });

        if (review.rating) {
            review.rating.setAttributes(ratingAttributes);
        } else {
            review.relatedRating.attach(ratingAttributes, { mintUrl: true });
        }
    }

    public setNotes(notes: string | null): void {
        this.assertRelationLoaded('note');

        const text = notes?.trim() || null;

        if (!text) {
            this.relatedNote.detach({ delete: true });

            return;
        }

        if (this.note) {
            this.note.setAttribute('text', text);
        } else {
            this.relatedNote.attach({ text }, { mintUrl: true });
        }
    }

    public async rate(rating: number): Promise<void> {
        await this.updateRating(rating);
    }

    public async updateRating(rating: number | null): Promise<void> {
        await this.loadRelationIfUnloaded('review');

        this.setRating(rating);

        await this.save();
    }

    public async updateNotes(notes: string | null): Promise<void> {
        await this.loadRelationIfUnloaded('note');

        this.setNotes(notes);

        await this.save();
    }

    protected assertRelationLoaded(relation: string): void {
        if (!this.exists() || this.isRelationLoaded(relation)) {
            return;
        }

        throw new RelationNotLoaded(this, relation);
    }

    protected async loadAllRelationsIfUnloaded(): Promise<void> {
        await this.loadRelationIfUnloaded('review');
        await this.loadRelationIfUnloaded('note');
        await this.loadRelationIfUnloaded('cast');
    }
}
