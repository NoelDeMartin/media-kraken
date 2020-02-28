import User from '@/models/users/User';
import MediaContainer from '@/models/soukai/MediaContainer';

interface OfflineUserJSON {
    name: string;
    avatar_url: string | null;
    storages: string[];
}

export default class OfflineUser extends User {

    public static fromJSON(json: OfflineUserJSON): OfflineUser {
        return new OfflineUser(json.name, json.avatar_url, json.storages);
    }

    constructor(
        name: string = 'Local (offline)',
        avatarUrl: string | null = null,
        storages: string[] = ['local/'],
    ) {
        super(name, avatarUrl, storages);
    }

    public toJSON(): OfflineUserJSON {
        return {
            name: this.name,
            avatar_url: this.avatarUrl,
            storages: this.storages,
        };
    }

    protected async getMoviesContainer(storage: string): Promise<MediaContainer> {
        const moviesContainer = await MediaContainer.find<MediaContainer>(storage + 'movies/');

        return  moviesContainer
            || MediaContainer.at(storage).create({ name: 'Movies' });
    }

}
