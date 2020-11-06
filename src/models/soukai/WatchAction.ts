import { FieldType, SingleModelRelation } from 'soukai';
import { SolidModel } from 'soukai-solid';

import Movie from '@/models/soukai/Movie';

export default class WatchAction extends SolidModel {

    public static ldpResource = false;

    public static rdfContexts = {
        'schema': 'https://schema.org/',
    };

    public static rdfsClasses = ['schema:WatchAction'];

    public static timestamps = ['createdAt'];

    public static fields = {
        object: {
            type: FieldType.Key,
            rdfProperty: 'schema:object',
            required: true,
        },
        startTime: FieldType.Date,
        endTime: FieldType.Date,
    };

    public movieRelationship(): SingleModelRelation {
        return this.belongsToOne(Movie, 'object');
    }

    public fixLegacyAttributes(url: string, object: string): void {
        this._attributes.url = url;
        this._attributes.object = object;
    }

}
