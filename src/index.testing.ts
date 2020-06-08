import SolidAuthClient from 'solid-auth-client';
import Soukai from 'soukai';
import Vue from 'vue';

import { AppLibraries } from '@/types/global';

import { start } from './bootstrap';

window.Runtime = {

    start,

    login: () => Vue.instance.$auth.loginOffline(),

    service: <K extends keyof Vue>(name: K): Vue[K] => Vue.instance[name],

    lib<K extends keyof AppLibraries>(name: K): AppLibraries[K] {
        switch (name) {
            case 'soukai':
                return Soukai;
            case 'solid-auth-client':
                return SolidAuthClient;
        }
    },

};
