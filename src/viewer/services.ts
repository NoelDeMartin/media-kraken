import Vue from 'vue';

import App from '@/services/App';
import Browser from '@/services/Browser';
import Service from '@/services/Service';
import Services from '@/services';
import UI from '@/services/UI';
import Viewer from '@/services/Viewer';

export async function bootServices(app: Vue): Promise<void> {
    const appServices: Record<string, Service<any, any>> = {
        $app: new App(false),
        $browser: new Browser(),
        $ui: new UI(),
        $viewer: new Viewer(true),
    };

    Services['$store'] = app.$store;

    Object.assign(Services, appServices);
    Object.assign(Vue.prototype, appServices);

    await Promise.all(Object.values(appServices).map((service: Service) => service.launch()));
}

export default Services;
