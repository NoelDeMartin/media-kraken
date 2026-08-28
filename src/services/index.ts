import Catalog from './Catalog';
import TMDB from './TMDB';

export const services = {
    $catalog: Catalog,
    $tmdb: TMDB,
};

export type AppServices = typeof services;

declare module '@aerogel/core' {
    interface Services extends AppServices {}
}
