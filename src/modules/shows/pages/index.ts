import { translate } from '@aerogel/core';
import { defineRouteBindings, defineRoutes } from '@aerogel/plugin-routing';

import Show from '@shows/models/Show';

import ShowsIndex from './Index.vue';
import ShowsShow from './Show.vue';

export const bindings = defineRouteBindings({
    show: Show,
});

export default defineRoutes([
    {
        name: 'shows.index',
        path: '/shows',
        component: ShowsIndex,
        title: () => translate('shows.title'),
    },
    {
        name: 'shows.show',
        path: '/shows/:show',
        component: ShowsShow,
        title: ({ show }) => (show as Show).name,
    },
]);
