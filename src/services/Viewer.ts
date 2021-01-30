import { SolidEngine } from 'soukai-solid';
import Soukai from 'soukai';

import MediaContainer from '@/models/soukai/MediaContainer';
import Movie from '@/models/soukai/Movie';

import { SearchIndex } from '@/services/Media';
import Service, { ComputedStateDefinitions } from '@/services/Service';

interface State {
    collectionUrl: string | null;
    movie: Movie | null;
    moviesContainer: MediaContainer | null;
}

interface ComputedState {
    searchIndex: SearchIndex;
}

const MOVIES_CHUNK_SIZE = 10;

export default class Viewer extends Service<State, ComputedState> {

    public readonly isActive: boolean;
    protected readonly storeNamespace: string = 'viewer';

    constructor(isActive: boolean = false) {
        super();

        this.isActive = isActive;
    }

    public get collectionUrl(): string | null {
        return this.state.collectionUrl;
    }

    public get movie(): Movie | null {
        return this.state.movie;
    }

    public get moviesContainer(): MediaContainer | null {
        return this.state.moviesContainer;
    }

    public get loaded(): boolean {
        return !!this.state.moviesContainer;
    }

    public get searchIndex(): SearchIndex {
        return this.getComputedState('searchIndex');
    }

    public async view(collectionUrl: string): Promise<void> {
        await this.updateMoviesContainer(collectionUrl);

        const url = new URL(location.href);
        url.searchParams.set('c', collectionUrl);
        history.replaceState(
            { collectionUrl },
            document.title,
            url.href,
        );
    }

    public setMovie(movie: Movie | null): void {
        this.setState({ movie });

        const url = new URL(location.href);
        movie ? url.searchParams.set('m', movie.url) : url.searchParams.delete('m');
        history.pushState(
            {
                collectionUrl: this.moviesContainer?.url,
                movieUrl: movie?.url || null,
            },
            document.title,
            url.href,
        );
    }

    protected async boot(): Promise<void> {
        if (!this.isActive)
            return;

        await super.boot();

        Soukai.useEngine(new SolidEngine(window.fetch.bind(window), { globbingBatchSize: null }));

        await this.load();

        this.watchWindowHistory();
    }

    protected getInitialState(): State {
        return {
            collectionUrl: null,
            movie: null,
            moviesContainer: null,
        };
    }

    protected getComputedStateDefinitions(): ComputedStateDefinitions<State, ComputedState> {
        return {
            searchIndex({ moviesContainer }: State) {
                if (!moviesContainer)
                    return [];

                const movies = moviesContainer.movies || [];

                return movies
                    .slice(0)
                    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                    .map(movie => ({ movie, searchableText: movie.uuid!.replace(/-/g, '') }));
            },
        };
    }

    private async load(): Promise<void> {
        const url = new URL(location.href);
        const collectionUrl = url.searchParams.get('c') || null;
        const movieUrl = url.searchParams.get('m') || null;

        if (collectionUrl)
            await this.updateMoviesContainer(collectionUrl);

        if (movieUrl)
            await this.updateMovie(movieUrl);

        history.replaceState(
            { collectionUrl, movieUrl },
            document.title,
            url.href,
        );
    }

    private watchWindowHistory(): void {
        window.onpopstate = async (event: PopStateEvent) => {
            const state = event.state ?? {};

            if (Object.keys(state).length === 0)
                return;

            const collectionUrl = state.collectionUrl ?? null;
            const movieUrl = state.movieUrl ?? null;

            if (collectionUrl !== this.moviesContainer?.url ?? null)
                await this.updateMoviesContainer(collectionUrl);

            if (movieUrl !== this.movie?.url ?? null)
                this.updateMovie(movieUrl);
        };
    }

    private async updateMoviesContainer(collectionUrl: string | null): Promise<void> {
        if (!collectionUrl) {
            this.setState({ collectionUrl: null, moviesContainer: null, movie: null });

            return;
        }

        const moviesContainer = await this.loadMoviesContainer(collectionUrl);

        this.setState({
            collectionUrl,
            moviesContainer,
        });
    }

    private updateMovie(movieUrl: string | null): void {
        if (!movieUrl || !this.moviesContainer) {
            this.setState({ movie: null });

            return;
        }

        const movie = this.moviesContainer.movies?.find(movie => movie.url === movieUrl) || null;

        this.setState({ movie });
    }

    private async loadMoviesContainer(collectionUrl: string): Promise<MediaContainer | null> {
        const moviesContainer = await MediaContainer.find<MediaContainer>(collectionUrl);

        if (!moviesContainer)
            return null;

        const movies = [];
        const resourceUrls = moviesContainer.resourceUrls;

        while (resourceUrls.length > 0 && movies.length < 30) {
            const chunkMovies = await Movie.from(moviesContainer.url).all({
                $in: resourceUrls.splice(0, MOVIES_CHUNK_SIZE),
            });

            movies.push(...chunkMovies);
        }

        if (movies.length === 0)
            return null;

        moviesContainer.setRelationModels('movies', movies);

        return moviesContainer;
    }

}
