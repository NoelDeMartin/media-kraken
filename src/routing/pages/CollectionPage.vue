<template>
    <div class="flex flex-col flex-grow w-full">
        <div id="collection-page-header" class="relative flex items-center -mx-2">
            <BaseTransition
                :enter-duration="150"
                :leave-duration="75"
                animation="fade"
                enter-active-class="delay-75"
            >
                <div v-if="!$ui.mobile || !searching" class="flex items-center">
                    <BaseMenu
                        v-slot="{ toggle: toggleActionsMenu }"
                        :options="[
                            { text: 'Import to collection', icon: 'upload', handle: importMedia },
                            { text: 'Export collection', icon: 'download', handle: exportCollection },
                        ]"
                    >
                        <BaseButton
                            icon="more"
                            aria-label="Open actions menu"
                            class="w-8 h-8 -ml-1 hover:bg-black-overlay"
                            style="padding-left:.4375rem;padding-right:.4375rem"
                            @click="toggleActionsMenu"
                        />
                    </BaseMenu>
                    <BasePageHeader>Collection ({{ filteredMovies.length }})</BasePageHeader>
                </div>
            </BaseTransition>
            <div class="flex-grow" />
            <BaseMenu
                v-slot="{ toggle: toggleWatchedFilterMenu }"
                :direction="searching ? 'top-left' : 'top-right'"
                :options="watchedFilterOptions"
            >
                <button class="flex items-center h-8 ml-2" @click="toggleWatchedFilterMenu">
                    <span class="mr-1 text-sm hidden whitespace-no-wrap desktop:block">{{ watchedFilterText }}</span>
                    <span class="mr-1 text-sm whitespace-no-wrap desktop:hidden">{{ watchedFilterMobileText }}</span>
                    <BaseIcon name="cheveron-down" class="w-5 h-5" />
                </button>
            </BaseMenu>
            <div
                class="relative transition-all duration-150"
                :class="{ 'w-full mx-2 desktop:w-64': searching, 'w-8': !searching }"
            >
                <BaseTransition :duration="100" animation="fade">
                    <BaseButton
                        v-show="!searching"
                        ref="filtersTrigger"
                        icon="search"
                        icon-class="w-4 h-4"
                        class="
                            absolute right-0 top-1/2 transform -translate-y-1/2 w-8 h-8 justify-center rounded-full
                            hover:bg-black-overlay
                        "
                        style="padding:0"
                        @click="showFilters"
                    />
                </BaseTransition>
                <BaseTransition :duration="150" animations="fade resize-width">
                    <input
                        v-show="searching"
                        ref="searchFilter"
                        v-model="searchFilter"
                        placeholder="Search in your collection..."
                        class="
                            absolute w-full right-0 top-1/2 transform -translate-y-1/2
                            text-sm py-1 bg-transparent appearance-none border-b-2 border-primary-200
                            focus:border-primary-300
                        "
                        @keyup.esc="searchFilter = ''"
                    >
                </BaseTransition>
            </div>
        </div>
        <MoviesGrid
            v-if="filteredMovies.length > 0"
            key="movies"
            within-collection
            :movies="filteredMovies"
        />
        <div v-else class="flex flex-col flex-grow items-center justify-center h-24 top-0 inset-x-0">
            <BaseIcon name="search-empty" class="w-16 h-16 text-gray-700 mb-4" />
            <span class="text-lg">No movies found matching these filters.</span>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

import Str from '@/utils/Str';

import Movie from '@/models/soukai/Movie';

import { MenuOption } from '@/components/base/BaseMenu.vue';
import ImportMediaModal from '@/components/modals/ImportMediaModal.vue';
import MoviesGrid from '@/components/MoviesGrid.vue';

const enum WatchedFilter {
    All = 'all',
    Watched = 'watched',
    WatchLater = 'watch-later',
}

interface WatchFilterMenuOptions extends MenuOption {
    watchedFilter: WatchedFilter;
    mobileText: string;
}

interface Data {
    watchedFilter: WatchedFilter;
    searchFilter: string | null;
    removeClickAwayListener: Function | null;
}

export default Vue.extend({
    components: {
        MoviesGrid,
    },
    data: (): Data => ({
        watchedFilter: WatchedFilter.All,
        searchFilter: null,
        removeClickAwayListener: null,
    }),
    computed: {
        watchedFilterOptions(): WatchFilterMenuOptions[] {
            const handle = ({ watchedFilter }: WatchFilterMenuOptions) => {
                this.watchedFilter = watchedFilter;
            };

            return [
                {
                    watchedFilter: WatchedFilter.All,
                    text: 'All movies',
                    mobileText: 'All',
                    icon: 'view-list',
                    handle,
                },
                {
                    watchedFilter: WatchedFilter.Watched,
                    text: 'Watched movies',
                    mobileText: 'Watched',
                    icon: 'checkmark',
                    handle,
                },
                {
                    watchedFilter: WatchedFilter.WatchLater,
                    text: 'Movies to watch later',
                    mobileText: 'Watch later',
                    icon: 'time',
                    handle,
                },
            ];
        },
        watchedFilterText(): string {
            return this.watchedFilterOptions.find(option => option.watchedFilter === this.watchedFilter)!.text;
        },
        watchedFilterMobileText(): string {
            return this.watchedFilterOptions.find(option => option.watchedFilter === this.watchedFilter)!.mobileText;
        },
        searching(): boolean {
            return this.removeClickAwayListener !== null;
        },
        allMovies(): Movie[] {
            return this.$media.movies
                .slice(0)
                .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        },
        filteredMovies(): Movie[] {
            let filteredMovies = this.allMovies;

            switch (this.watchedFilter) {
                case WatchedFilter.Watched:
                    filteredMovies = filteredMovies.filter(movie => movie.watched);
                    break;
                case WatchedFilter.WatchLater:
                    filteredMovies = filteredMovies.filter(movie => !movie.watched);
                    break;
            }

            if (this.searching) {
                const filterText = Str.slug(this.searchFilter!, '');

                filteredMovies = filteredMovies.filter(movie => Str.contains(movie.uuid!.replace('-',''), filterText));
            }

            return filteredMovies;
        },
    },
    created() {
        if (!this.$media.empty)
            return;

        this.$router.replace({ name: 'home' });
    },
    methods: {
        showFilters() {
            if (this.removeClickAwayListener !== null)
                return;

            const input = this.$refs.searchFilter as HTMLInputElement;
            const trigger = (this.$refs.filtersTrigger as Vue).$el as HTMLButtonElement;

            this.searchFilter = '';
            this.removeClickAwayListener = this.$ui.onClickAway(
                [input, trigger],
                () => this.searchFilter!.length === 0 && this.hideFilters(),
            );

            this.$nextTick(() => input.focus());
        },
        hideFilters() {
            if (this.removeClickAwayListener === null)
                return;

            this.removeClickAwayListener();

            this.searchFilter = null;
            this.removeClickAwayListener = null;
        },
        importMedia() {
            this.$ui.openModal(ImportMediaModal);
        },
        exportCollection() {
            this.$media.exportCollection();
        },
    },
});
</script>

<style lang="scss">
    #collection-page-header {
        height: calc(theme('fontSize.xl') * theme('lineHeight.tight') + theme('spacing.4') * 2);
    }
</style>
