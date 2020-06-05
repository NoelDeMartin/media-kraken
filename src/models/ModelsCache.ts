import { Attributes } from 'soukai';
import { openDB, IDBPDatabase, DBSchema, deleteDB } from 'idb';
import { SolidModel, SolidDocument } from 'soukai-solid';

interface CachedModelData {
    attributes?: Attributes;
    relationAttributes?:  MapObject<Attributes[]>;
    updatedAt: Date;
}

interface DatabaseSchema extends DBSchema {
    'models-cache': {
        value: CachedModelData;
        key: string;
    };
}

class ModelsCache {

    private connection?: IDBPDatabase<DatabaseSchema>;

    public async getFromDocument<M extends SolidModel>(
        document: SolidDocument,
        modelClass: typeof SolidModel,
        relatedModelClasses: MapObject<typeof SolidModel> = {},
        validAge: number = 0,
    ): Promise<M | null> {
        const existingData = await this.getModelData(document.url);
        const data = existingData || { updatedAt: null };
        const existingDataTime = data.updatedAt?.getTime() || 0;

        if (document.updatedAt.getTime() - existingDataTime <= validAge)
            return this.deserializeModel(data as CachedModelData, modelClass, relatedModelClasses) as M;

        data.updatedAt = document.updatedAt;

        if ('attributes' in data)
            delete data.attributes;

        if ('relationAttributes' in data)
            delete data.relationAttributes;

        await this.setModelData(document.url, data as CachedModelData);

        return null;
    }

    public async remember(model: SolidModel, relatedModels: MapObject<SolidModel[]> = {}): Promise<void> {
        const data = await this.getModelData(model.url);

        if (!data)
            return;

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

    private async getModelData(url: string): Promise<CachedModelData | null> {
        try {
            const connection = await this.getConnection();
            const transaction = connection.transaction('models-cache', 'readonly');

            return await transaction.store.get(url) || null;
        } catch (e) {
            return null;
        }
    }

    private async setModelData(url: string, data: CachedModelData): Promise<void> {
        const connection = await this.getConnection();
        const transaction = connection.transaction('models-cache', 'readwrite');

        transaction.store.put(data, url);

        await transaction.done;
    }

    private serializeModel(data: CachedModelData, model: SolidModel, relatedModels: MapObject<SolidModel[]>): void {
        data.attributes = model.getAttributes();
        data.relationAttributes = Object
            .entries(relatedModels)
            .reduce((relationAttributes, [relation, models]) => {
                relationAttributes[relation] = models.map(model => model.getAttributes());

                return relationAttributes;
            }, {} as MapObject<Attributes[]>);
    }

    private deserializeModel(
        data: CachedModelData,
        modelClass: typeof SolidModel,
        relatedModelClasses: MapObject<typeof SolidModel>,
    ): SolidModel | null {
        if (!('attributes' in data))
            return null;

        const model = new modelClass(data.attributes, true);

        for (const [relationName, relatedModelClass] of Object.entries(relatedModelClasses)) {
            model.setRelationModels(
                relationName,
                data.relationAttributes![relationName].map(attributes => new relatedModelClass(attributes, true)),
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
