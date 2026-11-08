import { registerFakeService } from '@aerogel/core';

import TMDB from '@/services/TMDB';
import FakeTMDB from '@/services/TMDB.fake';

export function registerFakes(): void {
    registerFakeService(TMDB, FakeTMDB);
}
