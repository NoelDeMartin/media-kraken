import { Attributes } from 'soukai';

import MediaContainer from '@/models/soukai/MediaContainer';
import Movie from '@/models/soukai/Movie';
import WatchAction from '@/models/soukai/WatchAction';

import { MediaContainers } from '@/services/Media';

// TODO check that this doesn't make worker code end up in the main bundle
import { Parameters, Result } from './LoadMediaWorker';
import WebWorkerRunner from './WebWorkerRunner';

export async function loadMedia(...params: Parameters): Promise<MediaContainers> {
    const containers: Partial<MediaContainers> = {};
    const worker = new Worker('@/workers/LoadMediaWorker.index.ts', { type: 'module' });
    const runner = new WebWorkerRunner<Parameters, Result>(worker, {
        onMoviesContainerLoaded(attributes: Attributes) {
            containers.movies = new MediaContainer(attributes, true);
            containers.movies.setRelationModels('movies', []);
        },
        onMovieLoaded(attributes: Attributes, actionsAttributes: Attributes[]) {
            const moviesContainer = containers.movies!;
            const movie = new Movie(attributes, true);

            movie.setRelationModels(
                'actions',
                actionsAttributes.map(attributes => new WatchAction(attributes, true)),
            );

            moviesContainer.setRelationModels('movies', [
                ...moviesContainer.movies!,
                movie,
            ]);
        },
    });

    await runner.run(...params);

    return containers as MediaContainers;
}
