import Catalog from './Catalog';
import TMDB from './TMDB';
import Dicovery from "./Dicovery";

export const services = {
    $catalog: Catalog,
    $tmdb: TMDB,
    $dicovery: Dicovery
};

export type AppServices = typeof services;

declare module '@aerogel/core' {
    interface Services extends AppServices {}
}
