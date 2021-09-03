import { arr } from '@noeldemartin/utils';
import { Fetch } from 'soukai-solid';
import Soukai from 'soukai';
import Vue from 'vue';

import Services from '@/services';

import { AppLibraries } from '@/types/global';
import EventBus from '@/utils/EventBus';
import JSONLDMoviesParser from '@/utils/parsers/JSONLDMoviesParser';

import { start } from './bootstrap';

const authenticatedRequests = arr<{ url: string; options: RequestInit }>();

window.testing = {

    async start() {
        EventBus.on<Fetch>('authenticated-fetch-ready', async fetch => {
            for (const request of authenticatedRequests) {
                await fetch(request.url, request.options);
            }

            authenticatedRequests.clear();
        });

        await start();
    },

    login: async () => {
        Services.$auth.loginOffline();

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
                return import(
                    /* webpackChunkName: 'authentication-legacy' */
                    '@/authentication/LegacyAuthenticator.chunk')
                        .then(chunk => chunk.default);
            case '@inrupt/solid-client-authn-browser':
                return import(
                    /* webpackChunkName: 'authentication-inrupt' */
                    '@/authentication/InruptAuthenticator.chunk')
                        .then(chunk => chunk.default);
        }
    },

    async addMovie(jsonld: object): Promise<void> {
        const media = Services.$media;
        const movie = await JSONLDMoviesParser.parse(jsonld);

        await media.ready;

        if (!media.loaded)
            await EventBus.until('media-loaded');

        await media.moviesContainer!.relatedMovies.save(movie);
    },

    queueAuthenticatedRequest(url, options) {
        authenticatedRequests.push({ url, options });
    },

};
