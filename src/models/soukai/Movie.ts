import { FieldType } from 'soukai';
import { SolidModel, SolidEmbedsRelation } from 'soukai-solid';

import WatchAction from '@/models/soukai/WatchAction';

export default class Movie extends SolidModel {

    public static rdfContexts = {
        'schema': 'https://schema.org/',
    };

    public static rdfsClasses = ['schema:Movie'];

    public static fields = {
        title: {
            type: FieldType.String,
            rdfProperty: 'schema:name',
            required: true,
        },
        posterUrl: {
            type: FieldType.String,
            rdfProperty: 'schema:image',
            required: true,
        },
        externalUrls: {
            type: FieldType.Array,
            rdfProperty: 'schema:sameAs',
            items: { type: FieldType.String },
        },
    };

    public get watched(): boolean {
        return this.actions && this.actions.length > 0;
    }

    public get uuid(): string | null {
        return this.url
            ? this.url.substring(this.url.lastIndexOf('/') + 1)
            : null;
    }

    public actionsRelationship(): SolidEmbedsRelation<Movie, WatchAction, typeof WatchAction> {
        return this.embeds(WatchAction) as any;
    }

    public async watch(): Promise<void> {
        const action = await this.actionsRelationship().create({ object: this.url });

        // TODO maybe this should be handled by soukai...
        if (this.isRelationLoaded('actions'))
            this.setRelationModels('actions', [...this.actions, action]);
    }

}
