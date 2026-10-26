import type { BelongsToOneRelation } from 'soukai-bis';

import type Rating from './Rating';
import Model from './Review.schema';

export default class Review extends Model {
    declare public readonly rating?: Rating;
    declare public readonly relatedRating: BelongsToOneRelation<this, Rating, typeof Rating>;
}
