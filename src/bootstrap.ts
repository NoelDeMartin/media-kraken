import Vue from 'vue';

import App from '@/App.vue';

import EventBus from '@/utils/EventBus';

import '@/components/base';

import { bootServices } from '@/services';
import plugins from '@/plugins';

Vue.config.productionTip = false;

Vue.instance = new Vue({
    ...plugins,
    render: h => h(App),
});

export async function start(): Promise<void> {
    Vue.instance.$events = EventBus;

    await bootServices(Vue.instance)
        .catch(error => error)
        .then(error => {
            const { $ui, $auth, $router } = Vue.instance;

            Vue.config.errorHandler = error => $ui.showError(error);
            window.onunhandledrejection = (event: PromiseRejectionEvent) => $ui.showError(event.reason);
            window.onerror = error => $ui.showError(error);

            if (!$auth.loggedIn && $router.currentRoute.name !== 'login')
                $router.replace({ name: 'login' });

            Vue.instance.$mount('#app');

            if (error) {
                alert('Something went wrong! (look at the console for details)');

                // eslint-disable-next-line no-console
                console.error(error);
            }
        });
}
