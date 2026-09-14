import { defineServiceState } from '@aerogel/core';

export default defineServiceState({
    name: 'tmdb',
    persist: ['genreTranslations'],
    initialState: () => ({
        genreTranslations: {} as Record<string, Record<number, string>>,
    }),
});
