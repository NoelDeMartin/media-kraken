import EventBus from '@/utils/EventBus';
import Files from '@/utils/Files';

import MediaContainer from '@/models/soukai/MediaContainer';
import Movie from '@/models/soukai/Movie';
import User from '@/models/users/User';

import Service from '@/services/Service';

interface State {
    moviesContainer: MediaContainer | null;
}

interface ImportListener {
    onStart?(totalRaw: number): void;
    onProgress?(current: number, totalRaw: number, imported: boolean): void;
    onCompleted?(totalRaw: number, totalImported: number): void;
}

export default class Media extends Service<State> {

    protected storeName: string = 'media';

    public get movies(): Movie[] {
        if (!this.state.moviesContainer)
            return [];

        return this.state.moviesContainer.movies || [];
    }

    public get moviesContainer(): MediaContainer | null {
        return this.state.moviesContainer;
    }

    public get empty(): boolean {
        return this.movies.length === 0;
    }

    public async importMovies(movies: Movie[], listener: ImportListener = {}): Promise<void> {
        // TODO implement createMany in soukai

        // TODO implement cancelling the import process
        // TODO show information on failed imports?

        listener.onStart && listener.onStart(movies.length);

        for (let index = 0; index < movies.length; index++) {
            const movie = movies[index];

            if (this.movies.find(collectionMovie => collectionMovie.is(movie))) {
                listener.onProgress && listener.onProgress(index, movies.length, false);

                continue;
            }

            await movie.completeAttributes();
            await this.moviesContainer!.saveMovie(movie);

            listener.onProgress && listener.onProgress(index, movies.length, true);
        }

        listener.onCompleted && listener.onCompleted(movies.length, movies.length);
    }

    public exportCollection(): void {
        Files.download(
            'my-collection.json',
            JSON.stringify(this.movies.map(movie => movie.toJSON())),
        );
    }

    protected async init(): Promise<void> {
        await super.init();
        await this.app.$auth.ready;

        if (this.app.$auth.isLoggedIn()) {
            await this.load(this.app.$auth.user);
        }

        EventBus.on('login', this.load.bind(this));
        EventBus.on('logout', this.unload.bind(this));
    }

    protected getInitialState(): State {
        return { moviesContainer: null };
    }

    private async load(user: User): Promise<void> {
        const { movies: moviesContainer } = await user.initContainers();

        if (!moviesContainer.isRelationLoaded('movies'))
            await moviesContainer.loadRelation('movies');

        const actionPromises = moviesContainer.movies!.map(async movie => {
            if (movie.isRelationLoaded('actions'))
                return;

            await movie.loadRelation('actions');
        });

        await Promise.all(actionPromises);

        this.setState({ moviesContainer });
    }

    private async unload(): Promise<void> {
        this.setState({ moviesContainer: null });
    }

}
