import { SolidEngine, Fetch, SolidDocument } from 'soukai-solid';
import SolidAuthClient, { Session } from 'solid-auth-client';
import Soukai from 'soukai';

import MediaContainer from '@/models/soukai/MediaContainer';
import TypeRegistration from '@/models/soukai/TypeRegistration';
import User from '@/models/users/User';

import RDFStore from '@/utils/RDFStore';
import Storage from '@/utils/Storage';
import Url from '@/utils/Url';

export interface SolidUserJSON {
    id: string;
    name: string;
    avatar_url: string | null;
    storages: string[];
    typeIndexUrl: string;
}

export default class SolidUser extends User<SolidUserJSON> {

    private static _fetch?: Fetch;

    private static get fetch(): Fetch {
        return this._fetch || SolidAuthClient.fetch.bind(SolidAuthClient);
    }

    public static setFetch(fetch: Fetch): void {
        this._fetch = fetch;
    }

    public static async trackSession(listener: (user: SolidUser | null) => void): Promise<void> {
        const onSessionUpdated = async (session: Session | void) => {
            if (!session) {
                listener(null);
                return;
            }

            const user = await this.fromSession(session);

            listener(user);
        };

        try {
            await SolidAuthClient.currentSession().then(onSessionUpdated);

            SolidAuthClient.trackSession(onSessionUpdated);
        } catch (error) {
            // TODO handle session expiration properly instead of communicating
            // this like an error
            alert("We couldn't validate your credentials, please login again");

            await this.logout();
            listener(null);
        }
    }

    public static async login(idp: string): Promise<void> {
        await SolidAuthClient.login(idp);
    }

    public static async logout(): Promise<void> {
        await SolidAuthClient.logout();

        // Clean up storage
        // @see https://github.com/solid/solid-auth-client/issues/96
        Storage.remove('solid-auth-client');
    }

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

    public static async fromSession({ webId }: Session): Promise<SolidUser> {
        const store = await RDFStore.fromUrl(this.fetch, webId);

        const name = store.statement(webId, 'foaf:name');
        const avatarUrl = store.statement(webId, 'foaf:img');
        const storages = store.statements(webId, 'pim:storage');
        const typeIndexStatement = store.statement(webId, 'solid:publicTypeIndex');

        // TODO load extended profile to find additional storages

        if (!typeIndexStatement)
            throw new Error("Couldn't find solid:publicTypeIndex in profile");

        if (storages.length === 0)
            throw new Error("Couldn't find pim:storage in profile");

        return new SolidUser(
            webId,
            name ? name.object.value : 'Unknown',
            avatarUrl ? avatarUrl.object.value : null,
            storages.map(storage => storage.object.value),
            typeIndexStatement.object.value,
        );
    }

    public readonly id: string;

    private storages: string[];
    private typeIndexUrl: string;
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
    }

    private get classDef(): typeof SolidUser {
        return (this.constructor as typeof SolidUser);
    }

    public initSoukaiEngine(): void {
        Soukai.useEngine(new SolidEngine(this.classDef.fetch));
    }

    public async logout(): Promise<void> {
        await this.classDef.logout();
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

        const store = await RDFStore.fromUrl(this.classDef.fetch, Url.parentDirectory(url!));
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
            const store = await RDFStore.fromUrl(this.classDef.fetch, this.typeIndexUrl);

            const moviesContainerType = store.statements(null, 'rdfs:type', 'solid:TypeRegistration')
                .find(statement =>
                    store.contains(statement.subject.value, 'solid:forClass', 'schema:Movie')  &&
                    store.contains(statement.subject.value, 'solid:instanceContainer'),
                );

            this.moviesContainerUrl = moviesContainerType
                ? store.statement(moviesContainerType.subject.value, 'solid:instanceContainer')!.object.value
                : null;
        }

        return this.moviesContainerUrl;
    }

}
