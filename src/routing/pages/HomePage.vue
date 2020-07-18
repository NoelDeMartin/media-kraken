<template>
    <div v-if="!$media.loaded">
        <!--
            Show empty page when loading, it should not take long and it's
            better than showing a loader that'll disappear too fast.
        -->
    </div>

    <div v-else-if="pendingMovies.length > 0">
        <div class="flex justify-between items-center">
            <BasePageHeader>Watch next:</BasePageHeader>
            <BaseMenu
                v-slot="{ toggle: toggleSortingMenu }"
                direction="top-right"
                :options="sortingOptions"
            >
                <button class="flex items-center h-8" @click="toggleSortingMenu">
                    <span class="mr-1 text-sm">{{ sortingText }}</span>
                    <BaseIcon name="cheveron-down" class="w-5 h-5" />
                </button>
            </BaseMenu>
        </div>
        <MoviesGrid :movies="pendingMoviesSummary" />
        <p
            v-if="pendingMovies.length > pendingMoviesSummary.length"
            class="mt-3 leading-relaxed max-w-readable text-center desktop:text-left"
        >
            You have more movies to watch in <BaseLink route="collection">
                your collection
            </BaseLink>.
        </p>
    </div>

    <div
        v-else-if="!$media.empty"
        class="max-w-readable mx-auto text-center items-center flex flex-col flex-grow justify-center -mt-10"
    >
        <BasePageHeader>
            All done!
        </BasePageHeader>
        <div class="bg-green-300 rounded-full p-3 mb-4">
            <BaseIcon name="checkmark" class="w-12 h-12 text-green-600" />
        </div>
        <p class="leading-relaxed">
            You don't have anything pending to watch! Check <BaseLink route="collection">
                your collection
            </BaseLink> to rewatch some of your favourites
            or <span class="hidden desktop:inline-block">press "s" to find something new</span>
            <BaseLink button class="desktop:hidden" @click.stop="$search.start()">
                find something new
            </BaseLink>.
        </p>
    </div>

    <div v-else class="flex flex-col flex-grow w-full max-w-readable mx-auto mb-4">
        <BasePageHeader>Welcome to Media Kraken!</BasePageHeader>
        <p class="text-gray-800 mb-3 leading-relaxed">
            I will help you keep track of your movies so that you don't miss a beat. But there's a catch,
            you'll only find <span class="font-medium">your movies</span> here. And only you can put movies
            in your collection!
        </p>
        <p class="text-gray-800 mb-3 leading-relaxed">
            Let's get started. Do you have any movies that you would like to add to your collection?
        </p>
        <BaseButton
            class="
                border border-primary-500 text-sm text-primary-700 justify-center my-4
                hover:bg-black-overlay
            "
            @click="importMedia"
        >
            Yes, I have some movies I'd like to import
        </BaseButton>
        <BaseButton
            class="
                border border-primary-500 text-sm text-primary-700 justify-center
                hover:bg-black-overlay
            "
            @click="seedCollection"
        >
            No, just give me something to watch
        </BaseButton>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

import Movie from '@/models/soukai/Movie';

import Storage from '@/utils/Storage';

import { MenuOption } from '@/components/base/BaseMenu.vue';
import ImportMediaModal from '@/components/modals/ImportMediaModal.vue';
import MoviesGrid from '@/components/MoviesGrid.vue';
import SeedCollectionModal from '@/components/modals/SeedCollectionModal.vue';

const enum Sorting {
    MostRecent = 'most-recent',
    Oldest = 'oldest',
}

interface SortMenuOption extends MenuOption {
    sorting: Sorting;
}

export default Vue.extend({
    components: {
        MoviesGrid,
    },
    data: () => ({ sorting: Storage.get('media-kraken-home-sorting', Sorting.MostRecent) }),
    computed: {
        sortingOptions(): SortMenuOption[] {
            const handle = ({ sorting }: SortMenuOption) => {
                this.sorting = sorting;

                Storage.set('media-kraken-home-sorting', sorting);
            };

            return [
                { sorting: Sorting.MostRecent, text: 'Most recent first', icon: 'hot', handle },
                { sorting: Sorting.Oldest, text: 'Oldest first', icon: 'hour-glass', handle },
            ];
        },
        sortingText(): string {
            return this.sortingOptions.find(option => option.sorting === this.sorting)!.text;
        },
        pendingMovies(): Movie[] {
            const pendingMovies = this.$media.movies.filter(movie => movie.pending);

            pendingMovies.sort((a: Movie, b: Movie) => a.createdAt.getTime() - b.createdAt.getTime());

            if (this.sorting === Sorting.MostRecent) {
                pendingMovies.reverse();
            }

            return pendingMovies;
        },
        pendingMoviesSummary(): Movie[] {
            return this.pendingMovies.slice(0, 10);
        },
    },
    methods: {
        importMedia() {
            this.$ui.openModal(ImportMediaModal);
        },
        seedCollection() {
            this.$ui.openModal(SeedCollectionModal);
        },
    },
});
</script>
