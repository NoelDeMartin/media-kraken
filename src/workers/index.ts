import MediaContainer from '@/models/soukai/MediaContainer';
import Movie from '@/models/soukai/Movie';
import WatchAction from '@/models/soukai/WatchAction';

import { MediaContainers } from '@/services/Media';
import Services from '@/services';

import Storage from '@/utils/Storage';

import { Parameters, Result, SerializedMoviesContainer, SerializedMovie } from './LoadMediaWorker';
import WebWorkerRunner from './WebWorkerRunner';

function hydrateMovie(data: SerializedMovie): Movie {
    const movie = new Movie(data.attributes, true);

    movie.setRelationModels(
        'actions',
        data.actionsAttributes.map(attributes => new WatchAction(attributes, true)),
    );

    return movie;
}

function hydrateMoviesContainer(data: SerializedMoviesContainer): MediaContainer {
    const moviesContainer = new MediaContainer(data.attributes, true);

    moviesContainer.setRelationModels('movies', data.movies.map(hydrateMovie));

    return moviesContainer;
}

export async function loadMedia(...params: Parameters): Promise<MediaContainers> {
    const worker = new Worker('@/workers/LoadMediaWorker.index.ts', { type: 'module' });
    const runner = new WebWorkerRunner<Parameters, Result>(
        worker,
        {
            updateProgressMessage: message => Services.$ui.updateBootupProgressMessage(message),
            confirmSchemaMigration: async () => {
                if (Storage.has('media-kraken-migrate-schema'))
                    return Storage.get('media-kraken-migrate-schema');

                const migrateSchema = await Services.$ui.confirmMarkdown('confirm-schema-migration', {
                    acceptLabel: 'Migrate',
                });

                Storage.set('media-kraken-migrate-schema', migrateSchema);

                return migrateSchema;
            },
        },
    );

    const result = await runner.run(...params);

    return { movies: hydrateMoviesContainer(result.movies) };
}
