import Vue from 'vue';

import '@/components/base';
import { removeBootupOverlay } from '@/bootstrap';
import { setUpPolyfills } from '@/utils/polyfills';

import { bootServices } from './services';
import App from './App.vue';
import plugins from './plugins';

// TODO move this to a routed page once sharing is implemented properly.
// see https://github.com/NoelDeMartin/media-kraken/issues/7

setUpPolyfills(window);

Vue.config.productionTip = false;
Vue.instance = new Vue({
    ...plugins,
    render: h => h(App),
});

bootServices(Vue.instance).then(() => {
    Vue.instance.$mount('#app');

    removeBootupOverlay();
});
