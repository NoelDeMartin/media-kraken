import { SolidEngine, Fetch, SolidDocument } from 'soukai-solid';
import SolidAuthClient from 'solid-auth-client';
import Soukai from 'soukai';

import MediaContainer from '@/models/soukai/MediaContainer';
import TypeRegistration from '@/models/soukai/TypeRegistration';
import User from '@/models/users/User';

import RDFStore from '@/utils/RDFStore';
import Url from '@/utils/Url';

export interface SolidUserJSON {
    id: string;
    name: string;
    avatar_url: string | null;
    storages: string[];
    typeIndexUrl: string;
}

export default class SolidUser extends User<SolidUserJSON> {

    public static isSolidUserJSON(json: object): json is SolidUserJSON {
        return 'id' in json
            && 'name' in json
            && 'avatar_url' in json
            && 'storages' in json
            && 'typeIndexUrl' in json;
    }

    public static async fromJSON(json: SolidUserJSON): Promise<SolidUser> {
        return new SolidUser(
            json.id,
            json.name,
            json.avatar_url,
            json.storages,
            json.typeIndexUrl,
        );
    }

    public readonly id: string;

    private storages: string[];
    private typeIndexUrl: string;
    private fetch: Fetch;
    private moviesContainerUrl?: string | null;

    constructor(
        id: string,
        name: string,
        avatarUrl: string | null,
        storages: string[],
        typeIndexUrl: string,
    ) {
        super(name, avatarUrl);

        this.id = id;
        this.storages = storages;
        this.typeIndexUrl = typeIndexUrl;
        this.fetch = SolidAuthClient.fetch.bind(SolidAuthClient);
    }

    public initSoukaiEngine(): void {
        Soukai.useEngine(new SolidEngine(this.fetch));
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
            typeIndexUrl: this.typeIndexUrl,
        };
    }

    protected async getMoviesContainerDocument(): Promise<SolidDocument | null> {
        const url = await this.getMoviesContainerUrl();

        if (!url)
            return null;

        const store = await RDFStore.fromUrl(Url.parentDirectory(url!));
        const modified = store.statement(url, 'purl:modified');

        if (!modified)
            return null;

        return new SolidDocument({ url, updatedAt: new Date(modified.object.value) }, true);
    }

    protected async initMoviesContainer(): Promise<MediaContainer> {
        const url = await this.getMoviesContainerUrl();
        const moviesContainer = url
            ? await MediaContainer.find<MediaContainer>(url)
            : null;

        return moviesContainer || this.createMoviesContainer();
    }

    protected async createMoviesContainer(): Promise<MediaContainer> {
        // TODO ask for preferred storage
        const storage = this.storages[0];
        const moviesContainer = new MediaContainer({ name: 'Movies' });

        await moviesContainer.save(storage);

        const typeRegistration = new TypeRegistration({
            forClass: 'https://schema.org/Movie',
            instanceContainer: moviesContainer.url,
        });

        await typeRegistration.save(this.typeIndexUrl);

        moviesContainer.setRelationModels('movies', []);

        return moviesContainer;
    }

    private async getMoviesContainerUrl(): Promise<string | null> {
        if (typeof this.moviesContainerUrl === 'undefined') {
            const store = await RDFStore.fromUrl(this.typeIndexUrl);

            const moviesContainerType = store
                .nodes('rdfs:type', 'solid:TypeRegistration')
                .find(node =>
                    store.contains(node, 'solid:forClass', 'schema:Movie')  &&
                    store.contains(node, 'solid:instanceContainer'),
                );

            this.moviesContainerUrl = moviesContainerType
                ? store.statement(moviesContainerType, 'solid:instanceContainer')!.object.value
                : null;
        }

        return this.moviesContainerUrl;
    }

}
