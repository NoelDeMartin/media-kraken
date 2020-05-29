import SolidAuthClient from 'solid-auth-client';
import Soukai from 'soukai';
import Vue from 'vue';

import { AppLibraries } from '@/types/global';

import OfflineUser from '@/models/users/OfflineUser';
import User from '@/models/users/User';

import { start } from './bootstrap';

window.Runtime = {

    lib<K extends keyof AppLibraries>(name: K): AppLibraries[K] {
        switch (name) {
            case 'soukai':
                return Soukai;
            case 'solid-auth-client':
                return SolidAuthClient;
        }
    },

    service<K extends keyof Vue>(name: K): Vue[K] {
        return Vue.instance[name];
    },

    start,

    login(): User {
        const user = new OfflineUser();

        Vue.instance.$store.commit('auth.setState', { user });
        Vue.instance.$events.emit('login', user);

        if (Vue.instance.$router.currentRoute.name === 'login')
            Vue.instance.$router.replace({ name: 'home' });

        localStorage.setItem('user', JSON.stringify(user.toJSON()));

        return user;
    },

};
