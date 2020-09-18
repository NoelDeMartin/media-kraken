
import Vue from 'vue';

import App from '@/services/App';
import Auth from '@/services/Auth';
import Browser from '@/services/Browser';
import Media from '@/services/Media';
import Search from '@/services/Search';
import Service from '@/services/Service';
import UI from '@/services/UI';

export async function bootServices(app: Vue): Promise<void> {
    Vue.prototype.$services = [
        Vue.prototype.$auth = new Auth(app),
        Vue.prototype.$browser = new Browser(app),
        Vue.prototype.$media = new Media(app),
        Vue.prototype.$search = new Search(app),
        Vue.prototype.$ui = new UI(app),
        Vue.prototype.$app = new App(app),
    ];

    await Promise.all(Vue.prototype.$services.map((service: Service) => service.ready));
}
