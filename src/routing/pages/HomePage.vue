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
                <button class="flex items-center" @click="toggleSortingMenu">
                    <span class="mr-1 text-sm">{{ sortingText }}</span>
                    <BaseIcon name="cheveron-down" class="w-5 h-5" />
                </button>
            </BaseMenu>
        </div>
        <MoviesGrid :movies="pendingMoviesSummary" />
        <p v-if="pendingMovies.length > pendingMoviesSummary.length" class="mt-3 leading-relaxed max-w-readable">
            You have more movies to watch in <BaseLink route="collection">
                your collection
            </BaseLink>.
        </p>
    </div>

    <div v-else-if="!$media.empty">
        <BasePageHeader>All done!</BasePageHeader>
        <p class="leading-relaxed">
            You don't have anything pending to watch! Check <BaseLink route="collection">
                your collection
            </BaseLink> to rewatch some of your favourites
            or press "s" to find something new.
        </p>
    </div>

    <div v-else class="flex flex-col flex-grow w-full">
        <BasePageHeader>Welcome to Media Kraken!</BasePageHeader>
        <p class="mb-3 leading-relaxed max-w-readable">
            I will help you keep track of your movies so that you don't have to. But there's a catch,
            you'll only find <span class="font-medium">your movies</span> here. I won't do like those sites
            that make suggestions and show you what's new. Only you can put movies in your collection!
        </p>
        <p class="mb-3 leading-relaxed max-w-readable">
            To start adding movies to your collection, you can import them from the following sources:
        </p>
        <MediaImporter class="mb-8" />
        <p class="mb-4 leading-relaxed max-w-readable">
            If you don't have anything to import, just press "s" and start searching.
        </p>
        <p class="mb-2 leading-relaxed max-w-readable">
            <span class="font-medium">Still not sure what to do?</span> Ok, let's get started with
            the 100 Top Rated Movies from IMDB:
        </p>
        <BaseButton
            class="
                border border-primary-500 text-sm text-primary-700 justify-center max-w-readable
                hover:bg-black-overlay
            "
            @click="importImdbTop100Movies()"
        >
            Import 100 Top Rated Movies
        </BaseButton>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

import Movie from '@/models/soukai/Movie';

import { MediaSource } from '@/services/Media';

import Storage from '@/utils/Storage';

import imdbTop100Data from '@/assets/data/imdb-top-100.json';

import { MenuOption } from '@/components/base/BaseMenu.vue';
import MediaImporter from '@/components/MediaImporter.vue';
import MoviesGrid from '@/components/MoviesGrid.vue';

const enum Sorting {
    MostRecent = 'most-recent',
    Oldest = 'oldest',
}

interface SortMenuOption extends MenuOption {
    sorting: Sorting;
}

export default Vue.extend({
    components: {
        MediaImporter,
        MoviesGrid,
    },
    data: () => ({ sorting: Storage.get('home-sorting', Sorting.MostRecent) }),
    computed: {
        sortingOptions(): SortMenuOption[] {
            const handle = ({ sorting }: SortMenuOption) => {
                this.sorting = sorting;

                Storage.set('home-sorting', sorting);
            };

            return [
                { sorting: Sorting.MostRecent, text: 'Most recent first', icon: 'arrow-thick-up', handle },
                { sorting: Sorting.Oldest, text: 'Oldest first', icon: 'arrow-thick-down', handle },
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
        importImdbTop100Movies() {
            this.$media.importMovies(imdbTop100Data, MediaSource.IMDB);
        },
    },
});
</script>
