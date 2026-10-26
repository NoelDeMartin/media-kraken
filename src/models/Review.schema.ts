import { belongsToOne, defineSchema } from 'soukai-bis';
import { url } from 'zod';

import Rating from './Rating';

export default defineSchema({
    rdfContext: 'https://schema.org/',
    rdfClass: 'Review',
    history: true,
    fields: {
        itemReviewedUrl: url().rdfProperty('itemReviewed'),
        reviewRatingUrl: url().rdfProperty('reviewRating').optional(),
    },
    relations: {
        rating: belongsToOne(Rating, 'reviewRatingUrl').usingSameDocument(),
    },
});
