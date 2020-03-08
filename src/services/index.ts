
import Vue from 'vue';

import Auth from '@/services/Auth';
import Config from '@/services/Config';
import Media from '@/services/Media';
import Search from '@/services/Search';
import Service from '@/services/Service';
import UI from '@/services/UI';

export async function bootServices(app: Vue): Promise<void> {
    Vue.prototype.$services = [
        Vue.prototype.$auth = new Auth(app),
        Vue.prototype.$config = new Config(app),
        Vue.prototype.$media = new Media(app),
        Vue.prototype.$search = new Search(app),
        Vue.prototype.$ui = new UI(app),
    ];

    await Promise.all(Vue.prototype.$services.map((service: Service) => service.ready));
}
