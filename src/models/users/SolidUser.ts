import { createPrivateTypeIndex, fetchSolidDocument } from '@noeldemartin/solid-utils';
import { objectWithoutEmpty, requireUrlParentDirectory, urlParentDirectory, uuid } from '@noeldemartin/utils';
import { SolidDocument, SolidEngine } from 'soukai-solid';
import Soukai from 'soukai';

import MediaContainer from '@/models/soukai/MediaContainer';
import ModelsCache from '@/models/ModelsCache';
import TypeRegistration from '@/models/soukai/TypeRegistration';
import User from '@/models/users/User';

import SolidAuth from '@/authentication/SolidAuth';

export interface SolidUserJSON {
    id: string;
    name: string;
    avatar_url: string | null;
    storages: string[];
    typeIndexUrl?: string;
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
    private typeIndexUrl?: string;
    private moviesContainerUrl?: string | null;

    constructor(
        id: string,
        name: string,
        avatarUrl: string | null,
        storages: string[],
        typeIndexUrl?: string,
    ) {
        super(name, avatarUrl);

        this.id = id;
        this.storages = storages;
        this.typeIndexUrl = typeIndexUrl;
    }

    public initSoukaiEngine(): void {
        // TODO implement maxGlobbingSize config option
        Soukai.useEngine(new SolidEngine(SolidAuth.fetch, {
            globbingBatchSize: null,
        }));
    }

    public async logout(): Promise<void> {
        await SolidAuth.logout();
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

    protected async getCachedMoviesContainer(): Promise<MediaContainer | null> {
        const moviesContainerDocument = await this.getMoviesContainerDocument();

        if (!moviesContainerDocument)
            return null;

        // Given that we've set the date in the client after receiving a response, there may be some
        // difference in the modified date used in the server depending on the network latency.
        // We will use a 10 seconds threshold to consider models valid.
        const models = await ModelsCache.getFromDocument(moviesContainerDocument, 10000);
        const [moviesContainer] = (models || []).filter(model => model.modelClass === MediaContainer);

        return moviesContainer as MediaContainer || null;
    }

    protected async initMoviesContainer(): Promise<MediaContainer> {
        const now = new Date();
        const url = await this.getMoviesContainerUrl();
        const existingContainer = url ? await MediaContainer.find<MediaContainer>(url) : null;
        const moviesContainer = existingContainer || await this.createMoviesContainer();

        // Reading containers causes their modified date to be updated in node-solid-server, so
        // we will set the modified date of this document in the cache to now.
        ModelsCache.rememberDocument(moviesContainer.url, now);
        ModelsCache.remember(moviesContainer, objectWithoutEmpty({ documents: moviesContainer.documents }));

        return moviesContainer;
    }

    private async getMoviesContainerDocument(): Promise<SolidDocument | null> {
        const url = await this.getMoviesContainerUrl() ?? '';
        const parentUrl = urlParentDirectory(url);

        if (!parentUrl)
            return null;

        try {
            const document = await fetchSolidDocument(parentUrl, SolidAuth.fetch);
            const modified = document.statement(url, 'purl:modified');

            return modified
                ? new SolidDocument({ url, updatedAt: new Date(modified.object.value) }, true)
                : null;
        } catch (error) {
            return null;
        }
    }

    private async getMoviesContainerUrl(): Promise<string | null> {
        if (typeof this.moviesContainerUrl === 'undefined')
            this.moviesContainerUrl = await this.fetchMoviesContainerUrl();

        return this.moviesContainerUrl;
    }

    private async fetchMoviesContainerUrl(): Promise<string | null> {
        try {
            const typeIndexUrl = this.typeIndexUrl ?? await this.createTypeIndex();
            const document = await fetchSolidDocument(typeIndexUrl, SolidAuth.fetch);

            const moviesContainerType = document
                .statements(undefined, 'rdfs:type', 'solid:TypeRegistration')
                .find(statement =>
                    document.contains(statement.subject.value, 'solid:forClass', 'schema:Movie')  &&
                    document.contains(statement.subject.value, 'solid:instanceContainer'),
                );

            return moviesContainerType
                ? document.statement(moviesContainerType.subject.value, 'solid:instanceContainer')?.object.value ?? null
                : null;
        } catch (error) {
            return null;
        }
    }

    private async createMoviesContainer(): Promise<MediaContainer> {
        // TODO ask for preferred storage
        const typeIndexUrl = this.typeIndexUrl ?? await this.createTypeIndex();
        const storage = this.storages[0];
        const moviesContainer = new MediaContainer({ name: 'Movies' });
        const rdfsClasses = [
            'https://schema.org/Movie',
            'https://schema.org/WatchAction',
        ];

        moviesContainer.setRelationModels('movies', []);
        moviesContainer.setRelationModels('documents', []);

        await moviesContainer.save(storage);
        await Promise.all(rdfsClasses.map(rdfsClass => {
            const typeRegistration = new TypeRegistration({
                forClass: rdfsClass,
                instanceContainer: moviesContainer.url,
            });

            typeRegistration.mintUrl(this.typeIndexUrl, true, uuid());

            return typeRegistration.save(requireUrlParentDirectory(typeIndexUrl));
        }));

        return moviesContainer;
    }

    private async createTypeIndex(): Promise<string> {
        const typeIndexUrl = await createPrivateTypeIndex({
            webId: this.id,
            storageUrls: this.storages,
            name: this.name,
        }, SolidAuth.fetch);

        this.typeIndexUrl = typeIndexUrl;

        return typeIndexUrl;
    }

}
