import Vue from 'vue';

import App from '@/App.vue';

import { setUpPolyfills } from '@/utils/polyfills';
import EventBus from '@/utils/EventBus';
import Time from '@/utils/Time';

import '@/components/base';

import { bootServices } from '@/services';
import { getForcedRoute } from '@/routing';
import plugins from '@/plugins';

setUpPolyfills(window);

Vue.config.productionTip = false;
Vue.instance = new Vue({
    ...plugins,
    render: h => h(App),
});

function prepareErrorHandlers() {
    const { $ui } = Vue.instance;

    Vue.config.errorHandler = error => $ui.showError(error);
    window.onunhandledrejection = (event: PromiseRejectionEvent) => $ui.showError(event.reason);
    window.onerror = error => $ui.showError(error);
}

function prepareInitialRoute() {
    const { $router } = Vue.instance;
    const initialRoute = getForcedRoute();

    if (initialRoute === null || $router.currentRoute.name === initialRoute)
        return;

    $router.replace({ name: initialRoute });
}

async function removeLoading() {
    document.body.classList.remove('loading');

    if (!window.impatientKrakenTimeout)
        await Time.wait(1000);

    else {
        clearTimeout(window.impatientKrakenTimeout);
        delete window.impatientKrakenTimeout;
    }

    document.getElementById('loading-overlay')?.remove();
}

export async function start(): Promise<void> {
    const servicesBooted = bootServices(Vue.instance).catch(error => {
        alert('Something went wrong! (look at the console for details)');

        // eslint-disable-next-line no-console
        console.error(error);
    });

    Vue.instance.$mount('#app');

    await servicesBooted;

    prepareErrorHandlers();
    prepareInitialRoute();
    EventBus.emit('booted');
    removeLoading();
}
