import Vue from 'vue';

import App from '@/App.vue';

import '@/components/base';

import { bootServices } from '@/services';
import plugins from '@/plugins';

Vue.config.productionTip = false;

Vue.instance = new Vue({
    ...plugins,
    render: h => h(App),
});

bootServices(Vue.instance)
    .catch(error => error)
    .then(error => {
        const { $auth, $router } = Vue.instance;

        if (!$auth.loggedIn && $router.currentRoute.name !== 'login')
            $router.replace({ name: 'login' });

        Vue.instance.$mount('#app');

        if (error) {
            alert('Something went wrong! (look at the console for details)');
            console.error(error);
        }
    });
