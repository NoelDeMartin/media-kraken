import Vue from 'vue';
import App from '@/App.vue';
import plugins from '@/plugins';

Vue.config.productionTip = false;

Vue.instance = new Vue({
    ...plugins,
    render: h => h(App),
});

Vue.instance.$mount('#app');
