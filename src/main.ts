import { bootstrap } from '@aerogel/core';
import i18n from '@aerogel/plugin-i18n';
import solid from '@aerogel/plugin-solid';

import '@/assets/css/main.css';
import cloud from '@/lib/cloud';
import env from '@/lib/env';
import routing from '@/pages';
import { services } from '@/services';

import App from './App.vue';
import lists from './modules/lists';
import movies from './modules/movies';
import shows from './modules/shows';

export default await bootstrap(App, {
    env,
    services,
    modules: [movies, shows, lists],
    plugins: [i18n(), routing(), solid(), cloud()],
});
