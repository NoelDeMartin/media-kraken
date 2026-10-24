import movies from '@/lib/fixtures/tmdb/movies.json';
import { defineStub } from '@/lib/stubs/helpers';
import type { TMDBMovie } from '@/services/TMDB';

export default defineStub((movies as unknown as TMDBMovie[]).map((movie) => [movie.title, movie]));
