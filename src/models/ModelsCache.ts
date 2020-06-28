import Soukai, { Attributes } from 'soukai';
import { openDB, IDBPDatabase, DBSchema, deleteDB } from 'idb';
import { SolidModel, SolidDocument } from 'soukai-solid';

interface CachedModelTimestamp {
    updatedAt: Date;
}

interface CachedModelData extends CachedModelTimestamp {
    modelName: string;
    attributes: Attributes;
    relationModelNames: MapObject<string>;
    relationAttributes:  MapObject<Attributes[]>;
}

interface DatabaseSchema extends DBSchema {
    'models-cache': {
        value: CachedModelTimestamp | CachedModelData;
        key: string;
    };
}

function isCachedModelData(obj: CachedModelTimestamp | CachedModelData): obj is CachedModelData {
    return 'modelName' in obj;
}

class ModelsCache {

    private connection?: IDBPDatabase<DatabaseSchema>;

    public async getFromDocument(document: SolidDocument, validAge: number = 0): Promise<SolidModel | null> {
        const existingData = await this.getModelData(document.url);

        if (
            existingData &&
            Math.abs(document.updatedAt.getTime() - existingData.updatedAt.getTime()) <= validAge
        )
            return this.deserializeModel(existingData);

        const data: CachedModelTimestamp = existingData || { updatedAt: document.updatedAt };

        data.updatedAt = document.updatedAt;

        if (isCachedModelData(data)) {
            delete data.modelName;
            delete data.attributes;
            delete data.relationModelNames;
            delete data.relationAttributes;
        }

        await this.setModelData(document.url, data);

        return null;
    }

    public async remember(
        model: SolidModel,
        relatedModels: MapObject<SolidModel[]> = {},
        updatedAt: Date | null = null,
    ): Promise<void> {
        let data = await this.getModelData(model.url);

        if (!data && updatedAt === null)
            return;

        data = data || { updatedAt } as CachedModelTimestamp;
        data.updatedAt = updatedAt || data.updatedAt;

        this.serializeModel(data, model, relatedModels);

        await this.setModelData(model.url, data);
    }

    public async clear(): Promise<void> {
        if (this.connection) {
            this.connection.close();
            delete this.connection;
        }

        await deleteDB('media-kraken');
    }

    private async getModelData(url: string): Promise<CachedModelTimestamp | CachedModelData | null> {
        try {
            const connection = await this.getConnection();
            const transaction = connection.transaction('models-cache', 'readonly');

            return await transaction.store.get(url) || null;
        } catch (e) {
            return null;
        }
    }

    private async setModelData(url: string, data: CachedModelTimestamp | CachedModelData): Promise<void> {
        const connection = await this.getConnection();
        const transaction = connection.transaction('models-cache', 'readwrite');

        transaction.store.put(data, url);

        await transaction.done;
    }

    private serializeModel(
        timestampData: CachedModelTimestamp,
        model: SolidModel,
        relatedModels: MapObject<SolidModel[]>,
    ): void {
        const data = timestampData as CachedModelData;

        data.modelName = model.modelClass.modelName;
        data.attributes = model.getAttributes();
        data.relationModelNames = Object
            .keys(relatedModels)
            .reduce((relationModelNames, relation) => {
                relationModelNames[relation] = model.getRelation(relation)!.relatedClass.modelName;

                return relationModelNames;
            }, {} as MapObject<string>);
        data.relationAttributes = Object
            .entries(relatedModels)
            .reduce((relationAttributes, [relation, models]) => {
                relationAttributes[relation] = models.map(model => model.getAttributes());

                return relationAttributes;
            }, {} as MapObject<Attributes[]>);
    }

    private deserializeModel(data: CachedModelTimestamp | CachedModelData): SolidModel | null {
        if (!isCachedModelData(data))
            return null;

        const modelClass = Soukai.model(data.modelName) as typeof SolidModel;
        const model = modelClass.newInstance(data.attributes, true);

        for (const [relation, relatedModelsAttributes] of Object.entries(data.relationAttributes)) {
            model.setRelationModels(
                relation,
                relatedModelsAttributes.map(attributes => {
                    const relatedModelClass = Soukai.model(data.relationModelNames[relation]) as typeof SolidModel;

                    return relatedModelClass.newInstance(attributes, true);
                }),
            );
        }

        return model;
    }

    private async getConnection(): Promise<IDBPDatabase<DatabaseSchema>> {
        if (!this.connection)
            this.connection = await openDB('media-kraken', 1, {
                upgrade(db) {
                    db.createObjectStore('models-cache');
                },
            });

        return this.connection;
    }

}

export default new ModelsCache();
