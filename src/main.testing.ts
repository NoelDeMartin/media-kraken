import Vue from 'vue';

import { start } from './bootstrap';

window.Runtime = {
    start,

    require<Module=any>(name: string): Module {
        const libs: any = {
            'solid-auth-client': require('solid-auth-client'),
            'soukai': require('soukai'),
        };

        return libs[name];
    },

    service<Service=any>(_: keyof Vue): Service {
        return Vue.instance[name];
    },

};
