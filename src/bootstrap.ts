import Vue from 'vue';

import App from '@/App.vue';

import EventBus from '@/utils/EventBus';
import Time from '@/utils/Time';

import '@/components/base';

import { bootServices } from '@/services';
import plugins from '@/plugins';

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
    const { $auth, $router } = Vue.instance;

    if ($auth.loggedIn || $router.currentRoute.name === 'login')
        return;

    $router.replace({ name: 'login' });
}

async function removeLoading() {
    document.body.classList.remove('loading');

    if (!window.impatientKrakenTimeout)
        await Time.wait(300);

    else {
        clearTimeout(window.impatientKrakenTimeout);
        delete window.impatientKrakenTimeout;
    }

    document.getElementById('loading-overlay')?.remove();
}

export async function start(): Promise<void> {
    Vue.instance.$events = EventBus;

    await bootServices(Vue.instance).catch(error => {
        alert('Something went wrong! (look at the console for details)');

        // eslint-disable-next-line no-console
        console.error(error);
    });

    prepareErrorHandlers();
    prepareInitialRoute();

    Vue.instance.$mount('#app');
    removeLoading();
}
