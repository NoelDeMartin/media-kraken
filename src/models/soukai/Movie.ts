import { FieldType, Attributes } from 'soukai';
import { SolidModel, SolidEmbedsRelation } from 'soukai-solid';

import WatchAction from '@/models/soukai/WatchAction';

import Arr from '@/utils/Arr';
import Str from '@/utils/Str';
import Url from '@/utils/Url';

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
        description: {
            type: FieldType.String,
            rdfProperty: 'schema:description',
        },
        releaseDate: {
            type: FieldType.Date,
            rdfProperty: 'schema:datePublished',
        },
        posterUrl: {
            type: FieldType.String,
            rdfProperty: 'schema:image',
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

    public get pending(): boolean {
        return !this.watched;
    }

    public get watchedAt(): Date | null {
        return this.watched ? this.actions[0].createdAt : null;
    }

    public get uuid(): string | null {
        return this.url
            ? this.url.substring(this.url.lastIndexOf('/') + 1)
            : null;
    }

    public actionsRelationship(): SolidEmbedsRelation<Movie, WatchAction, typeof WatchAction> {
        return this.embeds(WatchAction) as any;
    }

    public async watch(date?: Date): Promise<void> {
        const action = new WatchAction({ object: this.url });

        if (date)
            action.createdAt = date;

        try {
            // TODO maybe this should be handled by soukai...
            if (this.isRelationLoaded('actions'))
                this.setRelationModels('actions', [...this.actions, action]);

            await this.actionsRelationship().save(action);
        } catch (e) {
            if (this.isRelationLoaded('actions'))
                this.setRelationModels('actions', Arr.withoutItem(this.actions, action));

            throw e;
        }
    }

    protected newUrl(): string {
        return Url.resolve(this.classDef.collection, Str.slug(this.title));
    }

}
