import MediaContainer from '@/models/soukai/MediaContainer';
import TypeRegistration from '@/models/soukai/TypeRegistration';
import User from '@/models/users/User';

import RDFStore from '@/utils/RDFStore';

export default class SolidUser extends User {

    public readonly id: string;

    private store: RDFStore;

    constructor(id: string, name: string, avatarUrl: string | null, storages: string[], store: RDFStore) {
        super(name, avatarUrl, storages);

        this.id = id;
        this.store = store;
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
