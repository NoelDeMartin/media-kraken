<template>
    <div class="font-montserrat antialiased font-normal text-base text-gray-900 leading-tight bg-gray-100 max-h-screen">
        <div class="flex flex-col min-h-screen">
            <header class="flex justify-center p-4 desktop:pt-12">
                <component :is="$viewer.loaded ? 'button' : 'div'" @click="$viewer.setMovie(null)">
                    <BaseIcon name="media-kraken" class="w-auto h-16" />
                </component>
            </header>
            <main class="flex flex-col flex-grow mx-auto max-w-content w-full px-4">
                <template v-if="$viewer.loaded">
                    <MovieDetails v-if="$viewer.movie" :movie="$viewer.movie" />
                    <CollectionBrowser
                        v-else
                        :title="collectionTitle"
                        :description="collectionDescription"
                        :search-index="$viewer.searchIndex"
                    />
                </template>
                <NoCollection v-else />
            </main>
            <AppFooter />
        </div>
        <AppOverlay />
        <AppModals />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

import AppFooter from '@/components/AppFooter.vue';
import AppModals from '@/components/AppModals.vue';
import AppOverlay from '@/components/AppOverlay.vue';
import CollectionBrowser from '@/components/CollectionBrowser.vue';
import MovieDetails from '@/components/MovieDetails.vue';

import NoCollection from './components/NoCollection.vue';

export default Vue.extend({
    components: {
        AppFooter,
        AppModals,
        AppOverlay,
        CollectionBrowser,
        MovieDetails,
        NoCollection,
    },
    computed: {
        collectionTitle(): string {
            return this.$viewer.moviesContainer?.name || 'Collection';
        },
        collectionDescription(): string {
            return this.$viewer.moviesContainer?.description || undefined;
        },
    },
});
</script>

<style lang="scss" src="@/assets/styles/main.scss" />
