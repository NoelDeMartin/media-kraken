import MediaContainer from '@/models/soukai/MediaContainer';

export interface MediaContainers {
    movies: MediaContainer;
}

export default abstract class User {

    public name: string;
    public avatarUrl: string | null;
    public storages: string[];

    constructor(name: string, avatarUrl: string | null, storages: string[]) {
        this.name = name;
        this.avatarUrl = avatarUrl;
        this.storages = storages;
    }

    public async initContainers(): Promise<MediaContainers> {
        const storage = await this.getPreferredStorage();
        const movies = await this.getMoviesContainer(storage);

        return { movies };
    }

    protected async getPreferredStorage(): Promise<string> {
        // TODO ask for preferred storage
        return this.storages[0];
    }

    protected abstract getMoviesContainer(storage: string): Promise<MediaContainer>;

}
