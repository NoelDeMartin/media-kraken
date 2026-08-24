import moviesData from '@/lib/fixtures/movies.json';
import type Movie from '@/models/Movie';

import { defineStub } from './helpers';

export default defineStub((moviesData as unknown as Movie[]).map((movie) => [movie.title, movie]));
