import Lists from './Lists';

export const services = {
    $lists: Lists,
};

export type ListsServices = typeof services;

declare module '@aerogel/core' {
    interface Services extends ListsServices {}
}
