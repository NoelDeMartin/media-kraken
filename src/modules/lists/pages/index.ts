import { translate } from '@aerogel/core';
import { defineRouteBindings, defineRoutes } from '@aerogel/plugin-routing';
import type { RouteLocationNormalizedLoaded } from 'vue-router';

import List from '@lists/models/List';

import ListsIndex from './Index.vue';
import ListsNotFound from './NotFound.vue';
import ListsShow from './Show.vue';

export const bindings = defineRouteBindings({
    list: List,
});

export default defineRoutes([
    {
        name: 'lists.index',
        path: '/lists',
        component: ListsIndex,
        title: () => translate('lists.title'),
    },
    {
        name: 'lists.show',
        path: '/lists/:list',
        component: ListsShow,
        notFound: ListsNotFound,
        title: ({ list }) => (list as List).name,
        meta: {
            showHeader: (route) => route.query.sharing !== 'true',
        },
    },
]);

declare module 'vue-router' {
    interface RouteMeta {
        showHeader?: (route: RouteLocationNormalizedLoaded) => boolean;
    }
}
