import TMDB from './TMDB';

export const services = {
    $tmdb: TMDB,
};

export type AppServices = typeof services;

declare module '@aerogel/core' {
    interface Services extends AppServices {}
}
