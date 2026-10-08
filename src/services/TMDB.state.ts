import { defineServiceState } from '@aerogel/core';

export default defineServiceState({
    name: 'tmdb',
    initialState: () => ({
        genreTranslations: {} as Record<string, Record<number, string>>,
    }),
});
