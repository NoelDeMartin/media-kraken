import { isTruthy } from '@noeldemartin/utils';
import type { BelongsToManyRelation, HasOneRelation } from 'soukai-bis';

import { countryCodeFromUrl } from '@/lib/countries';
import { findExternalId } from '@/lib/domains';
import { genreKeysFromUrls, type GenreKey } from '@/lib/genres';
import { parseImdbId } from '@/lib/imdb';

import Model from './BaseMedia.schema';
import type PerformanceRole from './PerformanceRole';
import { normalizeRating } from './Rating';
import type Review from './Review';

export default class BaseMedia extends Model {
    declare public readonly cast?: PerformanceRole[];
    declare public readonly relatedCast: BelongsToManyRelation<this, PerformanceRole, typeof PerformanceRole>;
    declare public readonly review?: Review;
    declare public readonly relatedReview: HasOneRelation<this, Review, typeof Review>;

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

    public async rate(rating: number): Promise<void> {
        const ratingAttributes = { ratingValue: normalizeRating(rating) };
        const review =
            (await this.loadRelationIfUnloaded<Review | null>('review')) ??
            this.relatedReview.attach({}, { mintUrl: true });

        if (review.rating) {
            review.rating.setAttributes(ratingAttributes);
        } else {
            review.relatedRating.attach(ratingAttributes, { mintUrl: true });
        }

        if (this.exists()) {
            await this.save();
        }
    }

    public async updateRating(rating: number | null): Promise<void> {
        await (rating === null ? this.removeRating() : this.rate(rating));
    }

    public async removeRating(): Promise<void> {
        const review = await this.loadRelationIfUnloaded<Review | null>('review');

        if (!review) {
            return;
        }

        await review.relatedRating.delete();
        await this.relatedReview.delete();
    }

    protected async loadAllRelationsIfUnloaded(): Promise<void> {
        await this.loadRelationIfUnloaded('review');
        await this.loadRelationIfUnloaded('cast');
    }
}
