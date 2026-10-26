import Model from './Rating.schema';

export const MIN_RATING = 0;
export const MAX_RATING = 10;

export function normalizeRating(rating: number): number {
    return Math.min(MAX_RATING, Math.max(MIN_RATING, Math.round(rating)));
}

export default class Rating extends Model {}
