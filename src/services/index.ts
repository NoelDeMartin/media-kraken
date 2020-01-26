
import Vue from 'vue';

import Auth from '@/services/Auth';
import Media from '@/services/Media';
import Service from '@/services/Service';

export async function bootServices(app: Vue): Promise<void> {
    Vue.prototype.$services = [
        Vue.prototype.$auth = new Auth(app),
        Vue.prototype.$media = new Media(app),
    ];

    await Promise.all(Vue.prototype.$services.map((service: Service) => service.ready));
}
