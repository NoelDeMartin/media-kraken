import { Store } from 'vuex';
import Vue from 'vue';
import VueRouter, { Route } from 'vue-router';

import App from '@/services/App';
import Auth from '@/services/Auth';
import Browser from '@/services/Browser';
import Media from '@/services/Media';
import Search from '@/services/Search';
import Service from '@/services/Service';
import UI from '@/services/UI';
import Viewer from '@/services/Viewer';

export interface Services {
    $app: App;
    $auth: Auth;
    $browser: Browser;
    $media: Media;
    $route: Route;
    $router: VueRouter;
    $search: Search;
    $store: Store<any>;
    $ui: UI;
    $viewer: Viewer;
}

const Services = {} as Services;

export async function bootServices(app: Vue): Promise<void> {
    const appServices: Record<string, Service<any, any>> = {
        $app: new App(),
        $auth: new Auth(),
        $browser: new Browser(),
        $media: new Media(),
        $search: new Search(),
        $ui: new UI(),
        $viewer: new Viewer(),
    };

    Services['$router'] = app.$router;
    Services['$route'] = app.$route;
    Services['$store'] = app.$store;

    Object.assign(Services, appServices);
    Object.assign(Vue.prototype, appServices);

    await Promise.all(Object.values(appServices).map((service: Service) => service.launch()));
}

export default Services;
