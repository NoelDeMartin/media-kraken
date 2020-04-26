import MediaContainer from '@/models/soukai/MediaContainer';

import { MediaContainers } from '@/services/Media';

export default abstract class User<JSON extends object=object> {

    public name: string;
    public avatarUrl: string | null;
    public storages: string[];

    protected constructor(name: string, avatarUrl: string | null, storages: string[]) {
        this.name = name;
        this.avatarUrl = avatarUrl;
        this.storages = storages;
    }

    public async initContainers(): Promise<MediaContainers> {
        const storage = await this.getPreferredStorage();
        const movies = await this.getMoviesContainer(storage);

        return { movies };
    }

    public abstract toJSON(): JSON;

    public abstract initSoukaiEngine(): void;

    public abstract clearClientData(): void;

    protected async getPreferredStorage(): Promise<string> {
        // TODO ask for preferred storage
        return this.storages[0];
    }

    protected abstract getMoviesContainer(storage: string): Promise<MediaContainer>;

}
