import { formatNumber } from '@/lib/formatting';
import { MAX_RATING } from '@/models/Rating';

export const MAX_STARS = 5;
export const HALF_STAR = 0.5;

export function ratingToStars(rating: number): number {
    return (rating / MAX_RATING) * MAX_STARS;
}

export function starsToRating(stars: number): number {
    return (stars / MAX_STARS) * MAX_RATING;
}

export function formatRatingAsStars(rating: number): string {
    return formatNumber(ratingToStars(rating));
}
