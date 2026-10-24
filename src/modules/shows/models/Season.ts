import type { BelongsToManyRelation } from 'soukai-bis';

import type Episode from './Episode';
import Model from './Season.schema';

export default class Season extends Model {
    declare public readonly episodes?: Episode[];
    declare public readonly relatedEpisodes: BelongsToManyRelation<this, Episode, typeof Episode>;
}
