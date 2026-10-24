import { translate } from '@aerogel/core';
import { defineRouteBindings, defineRoutes } from '@aerogel/plugin-routing';

import List from '@lists/models/List';

import ListsIndex from './Index.vue';
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
        title: ({ list }) => (list as List).name,
    },
]);
