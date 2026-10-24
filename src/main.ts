import { bootstrap } from '@aerogel/core';
import i18n from '@aerogel/plugin-i18n';
import localFirst from '@aerogel/plugin-local-first';
import routing from '@aerogel/plugin-routing';
import solid from '@aerogel/plugin-solid';

import '@/assets/css/main.css';
import env from '@/lib/env';
import routes from '@/pages';
import { services } from '@/services';

import App from './App.vue';
import lists from './modules/lists';
import movies from './modules/movies';
import shows from './modules/shows';

export default await bootstrap(App, {
    env,
    services,
    modules: [movies, shows, lists],
    plugins: [i18n(), routing({ routes }), solid(), localFirst()],
});
