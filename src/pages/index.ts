import { defineRoutes } from '@aerogel/plugin-routing';

import Home from './Home.vue';

export default defineRoutes([{ name: 'home', path: '/', component: Home }]);
