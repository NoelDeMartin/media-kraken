import { SolidDocument } from 'soukai-solid';

import MediaContainer from '@/models/soukai/MediaContainer';
import ModelsCache from '@/models/ModelsCache';

import { MediaContainers } from '@/services/Media';

export default abstract class User<JSON extends object=object> {

    public name: string;
    public avatarUrl: string | null;

    protected constructor(name: string, avatarUrl: string | null) {
        this.name = name;
        this.avatarUrl = avatarUrl;
    }

    public async resolveMediaContainers(): Promise<MediaContainers> {
        const cachedMovies = await this.getCachedMoviesContainer();

        return { movies: cachedMovies || await this.initAndRememberMoviesContainer() };
    }

    public async login(): Promise<void> {
        //
    }

    public async logout(): Promise<void> {
        //
    }

    public abstract initSoukaiEngine(): void;

    public abstract toJSON(): JSON;

    protected abstract getMoviesContainerDocument(): Promise<SolidDocument | null>;

    protected abstract initMoviesContainer(): Promise<MediaContainer>;

    private async getCachedMoviesContainer(): Promise<MediaContainer | null> {
        const moviesContainerDocument = await this.getMoviesContainerDocument();

        if (!moviesContainerDocument)
            return null;

        // TODO measure reading time and update updatedAt for better estimates

        // Reading containers causes their modified date to be updated in node-solid-server.
        // So we will assume that a modification made within 2 minutes of prepping the
        // cache was caused by a read.
        const ageThreshold = 60000;

        return ModelsCache.getFromDocument<MediaContainer>(
            moviesContainerDocument,
            MediaContainer,
            { documents: SolidDocument },
            ageThreshold,
        );
    }

    private async initAndRememberMoviesContainer(): Promise<MediaContainer> {
        const movies = await this.initMoviesContainer();

        ModelsCache.remember(movies, { documents: movies.documents });

        return movies;
    }

}
