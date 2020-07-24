import Vue from 'vue';

import App from '@/App.vue';

import { setUpPolyfills } from '@/utils/polyfills';
import EventBus from '@/utils/EventBus';
import Sentry from '@/utils/Sentry';
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

function setErrorHandler(handler: (error: any) => void) {
    Vue.config.errorHandler = handler;
    window.onunhandledrejection = (event: PromiseRejectionEvent) => handler(event.reason);
    window.onerror = handler;
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
    Sentry.init();
    setErrorHandler(error => Sentry.report(error));

    const servicesBooted = bootServices(Vue.instance).catch(error => {
        // eslint-disable-next-line no-console
        console.error(error);
        Sentry.report(error);

        alert('Something went wrong! (look at the console for details)');
    });

    Vue.instance.$mount('#app');

    await servicesBooted;

    setErrorHandler(error => Vue.instance.$ui.showError(error));
    prepareInitialRoute();
    EventBus.emit('booted');
    removeLoading();
}
