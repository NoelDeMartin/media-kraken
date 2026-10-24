import shows from '@/lib/fixtures/tmdb/shows.json';
import { defineStub } from '@/lib/stubs/helpers';
import type { TMDBShow } from '@/services/TMDB';

export default defineStub((shows as unknown as TMDBShow[]).map((show) => [show.name, show]));
