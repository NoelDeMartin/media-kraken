import SolidAuthClient from 'solid-auth-client';
import Soukai from 'soukai';
import Vue from 'vue';

import { AppLibraries } from '@/types/global';
import EventBus from '@/utils/EventBus';
import JSONLDMoviesParser from '@/utils/parsers/JSONLDMoviesParser';

import { start } from './bootstrap';

window.Runtime = {

    start,

    login: async () => {
        Vue.instance.$auth.loginOffline();

        await Promise.all([
            EventBus.until('login'),
            EventBus.until('media-loaded'),
        ]);
    },

    service: <K extends keyof Vue>(name: K): Vue[K] => Vue.instance[name],

    lib<K extends keyof AppLibraries>(name: K): AppLibraries[K] {
        switch (name) {
            case 'soukai':
                return Soukai;
            case 'solid-auth-client':
                return SolidAuthClient;
        }
    },

    async addMovie(jsonld: object): Promise<void> {
        const media = Vue.instance.$media;
        const movie = await JSONLDMoviesParser.parse(jsonld);

        await media.ready;

        if (!media.loaded)
            await EventBus.until('media-loaded');

        await media.moviesContainer!.relatedMovies.save(movie);
    },

};
