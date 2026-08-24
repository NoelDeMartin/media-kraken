import type { BelongsToOneRelation } from 'soukai-bis';

import Movie from '@/models/Movie';

import Model from './WatchAction.schema';

export default class WatchAction extends Model {
    declare public readonly movie?: Movie;
    declare public readonly relatedMovie: BelongsToOneRelation<this, Movie, typeof Movie>;
}
