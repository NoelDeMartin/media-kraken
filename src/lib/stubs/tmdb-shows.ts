import shows from '@/lib/fixtures/tmdb/shows.json';
import type { TMDBShow } from '@/services/TMDB';

import { defineStub } from './helpers';

export default defineStub((shows as unknown as TMDBShow[]).map((show) => [show.name, show]));
