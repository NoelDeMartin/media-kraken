import tmdbMoviesData from '@/lib/fixtures/tmdb-movies.json';
import type { TMDBMovie } from '@/services/TMDB';

import { defineStub } from './helpers';

export default defineStub((tmdbMoviesData as unknown as TMDBMovie[]).map((movie) => [movie.title, movie]));
