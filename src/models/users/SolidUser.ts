import { SolidEngine, Fetch } from 'soukai-solid';
import SolidAuthClient from 'solid-auth-client';
import Soukai from 'soukai';

import MediaContainer from '@/models/soukai/MediaContainer';
import TypeRegistration from '@/models/soukai/TypeRegistration';
import User from '@/models/users/User';

import RDFStore from '@/utils/RDFStore';

export interface SolidUserJSON {
    id: string;
    name: string;
    avatar_url: string | null;
    storages: string[];
}

export default class SolidUser extends User<SolidUserJSON> {

    public static isSolidUserJSON(json: object): json is SolidUserJSON {
        return 'id' in json
            && 'name' in json
            && 'avatar_url' in json
            && 'storages' in json;
    }

    public static async fromJSON(json: SolidUserJSON): Promise<SolidUser> {
        return new SolidUser(
            json.id,
            json.name,
            json.avatar_url,
            json.storages,
            await RDFStore.fromUrl(json.id),
        );
    }

    public readonly id: string;

    private store: RDFStore;
    private fetch: Fetch;

    constructor(
        id: string,
        name: string,
        avatarUrl: string | null,
        storages: string[],
        store: RDFStore,
    ) {
        super(name, avatarUrl, storages);

        this.id = id;
        this.store = store;
        this.fetch = SolidAuthClient.fetch.bind(SolidAuthClient);
    }

    public initSoukaiEngine(): void {
        Soukai.useEngine(new SolidEngine(this.fetch, { useCache: true }));
    }

    public clearClientData(): void {
        (Soukai.engine as SolidEngine).cache.clear();
    }

    public setFetch(fetch: Fetch): void {
        this.fetch = fetch;
    }

    public toJSON(): SolidUserJSON {
        return {
            id: this.id,
            name: this.name,
            avatar_url: this.avatarUrl,
            storages: this.storages,
        };
    }

    protected async getMoviesContainer(storage: string): Promise<MediaContainer> {
        const typeIndexStatement = this.store.statement(this.id, 'solid:publicTypeIndex');

        if (!typeIndexStatement)
            throw new Error("Couldn't find solid:publicTypeIndex in profile");

        const typeIndexUrl = typeIndexStatement.object.value;
        const moviesContainer = await this.getMoviesContainerFromTypeIndex(typeIndexUrl);

        return moviesContainer || this.createMoviesContainer(storage, typeIndexUrl);
    }

    protected async getMoviesContainerFromTypeIndex(typeIndexUrl: string): Promise<MediaContainer | null> {
        const store = await RDFStore.fromUrl(typeIndexUrl);

        const moviesContainerType = store
            .nodes('rdfs:type', 'solid:TypeRegistration')
            .find(node =>
                store.contains(node, 'solid:forClass', 'schema:Movie')  &&
                store.contains(node, 'solid:instanceContainer'),
            );

        if (!moviesContainerType)
            return null;

        return MediaContainer.find<MediaContainer>(
            store.statement(moviesContainerType, 'solid:instanceContainer')!.object.value,
        );
    }

    protected async createMoviesContainer(storage: string, typeIndexUrl: string): Promise<MediaContainer> {
        const moviesContainer = new MediaContainer({ name: 'Movies' });

        await moviesContainer.save(storage);

        const typeRegistration = new TypeRegistration({
            forClass: 'https://schema.org/Movie',
            instanceContainer: moviesContainer.url,
        });

        await typeRegistration.save(typeIndexUrl);

        moviesContainer.setRelationModels('movies', []);

        return moviesContainer;
    }

}
