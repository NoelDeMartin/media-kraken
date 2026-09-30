import type { BelongsToOneRelation } from 'soukai-bis';

import Model from './PerformanceRole.schema';
import type Person from './Person';

export default class PerformanceRole extends Model {
    declare public readonly actor?: Person;
    declare public readonly relatedActor: BelongsToOneRelation<this, Person, typeof Person>;
}
