import MediaContainer from '@/models/soukai/MediaContainer';

import { MediaContainers } from '@/services/Media';

export default abstract class User<JSON extends object=object> {

    public name: string;
    public avatarUrl: string | null;

    protected constructor(name: string, avatarUrl: string | null) {
        this.name = name;
        this.avatarUrl = avatarUrl;
    }

    public async resolveMediaContainers(): Promise<MediaContainers> {
        const cachedMoviesContainer = await this.getCachedMoviesContainer();

        return { movies: cachedMoviesContainer || await this.initMoviesContainer() };
    }

    public async login(): Promise<void> {
        //
    }

    public async logout(): Promise<void> {
        //
    }

    public abstract initSoukaiEngine(): void;

    public abstract toJSON(): JSON;

    protected abstract getCachedMoviesContainer(): Promise<MediaContainer | null>;

    protected abstract initMoviesContainer(): Promise<MediaContainer>;

}
