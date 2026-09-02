import { isDevelopment } from '@noeldemartin/utils';
import type { GetModelInput } from 'soukai-bis';

import Movie from '@/models/Movie';
import Catalog from '@/services/Catalog';

import ProcessingJob from './ProcessingJob';

export default class SeedCollection extends ProcessingJob<GetModelInput<typeof Movie>, void> {
    constructor(movies: GetModelInput<typeof Movie>[]) {
        super(movies);
    }

    protected override async run(): Promise<void> {
        for (const [index, attributes] of this.items.entries()) {
            this.assertNotCancelled();

            const movie = new Movie(attributes);
            const imported = await this.importMovie(movie);

            if (!imported) {
                await movie.save();
            }

            await this.markItemCompleted(index);
        }
    }

    private async importMovie(movie: Movie): Promise<Movie | null> {
        try {
            if (!movie.imdbId) {
                throw new Error('Movie has no IMDB ID');
            }

            const imported = await Catalog.newMovieFromImdb(movie.imdbId);

            await imported.save();

            return imported;
        } catch (error) {
            if (isDevelopment()) {
                console.warn(`Failed to import movie ${movie.imdbId}:`, error);
            }

            return null;
        }
    }
}
