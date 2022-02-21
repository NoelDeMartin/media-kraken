<template>
    <div class="flex flex-col flex-grow w-full">
        <MarkdownContent
            v-if="description"
            class="markdown-content--typography max-w-readable self-center"
            :content="description"
        />
        <BaseTransition
            :duration="100"
            animations="resize-height"
            enter-to-class="max-h-41px"
            leave-class="max-h-41px"
        >
            <div v-if="$ui.mobile && searching">
                <BasePageHeader v-if="$ui.mobile && searching" no-margin class="mt-4 flex">
                    <span class="truncate">{{ title }}</span>
                    <span class="pl-1">({{ filteredMovies.length }})</span>
                </BasePageHeader>
            </div>
        </BaseTransition>
        <div class="movies-browser__header relative flex items-center -mx-2">
            <BaseTransition
                :enter-duration="150"
                :leave-duration="75"
                animation="fade"
                enter-active-class="delay-75"
            >
                <div
                    v-if="!$ui.mobile || !searching"
                    class="flex items-center"
                    :class="{
                        'ml-2': $viewer.isActive,
                        'overflow-hidden hover:overflow-visible': !actionsMenuOpen,
                    }"
                >
                    <BaseMenu
                        v-if="!$viewer.isActive"
                        v-slot="{ toggle: toggleActionsMenu }"
                        :options="[
                            { text: 'Import to collection', icon: 'upload', handle: importMedia },
                            { text: 'Export collection', icon: 'download', handle: exportCollection },
                        ]"
                        @opened="actionsMenuOpen = true"
                        @closed="actionsMenuOpen = false"
                    >
                        <BaseButton
                            icon="more"
                            aria-label="Open actions menu"
                            class="w-8 h-8 -ml-1 hover:bg-black-overlay"
                            style="padding-left:.4375rem;padding-right:.4375rem"
                            @click="toggleActionsMenu"
                        />
                    </BaseMenu>
                    <BasePageHeader class="flex">
                        <span class="truncate">{{ title }}</span>
                        <span class="pl-1">({{ filteredMovies.length }})</span>
                    </BasePageHeader>
                </div>
            </BaseTransition>
            <div class="flex-grow" />
            <BaseMenu
                v-if="!$viewer.isActive"
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
                :class="{
                    'w-full mx-2 desktop:w-64': searching,
                    'w-8 flex-shrink-0': !searching,
                }"
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
                        :title="`Press &quot;f&quot; to filter ${collectionQualifier} collection`"
                        @click="showFilters"
                    />
                </BaseTransition>
                <BaseTransition :duration="150" animations="fade resize-width">
                    <input
                        v-show="searching"
                        ref="searchFilter"
                        v-model="searchFilter"
                        :placeholder="`Search in ${collectionQualifier} collection...`"
                        aria-label="Filter collection"
                        class="
                            absolute w-full right-0 top-1/2 transform -translate-y-1/2
                            text-sm py-1 bg-transparent appearance-none border-b-2 border-primary-200
                            focus:border-primary-300
                        "
                        @keyup.esc="hideFilters"
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
        <button
            v-if="showGoTop"
            type="button"
            title="Go top"
            aria-label="Go top"
            class="
                fixed flex items-center justify-center bottom-0 right-0 mr-4 mb-8 z-30
                bg-primary-500 text-white rounded-full w-10 h-10 shadow-lg hover:bg-red-700
            "
            @click="goToTop"
        >
            <BaseIcon name="cheveron-up" class="w-8 h-8" />
        </button>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

import DOM from '@/utils/DOM';
import Str from '@/utils/Str';

import Movie from '@/models/soukai/Movie';

import { SearchIndex } from '@/services/Media';

import { MenuOption } from '@/components/base/BaseMenu.vue';
import MarkdownContent from '@/components/MarkdownContent.vue';
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
    actionsMenuOpen: boolean;
    watchedFilter: WatchedFilter;
    searchFilter: string | null;
    showGoTop: boolean;
    removeClickAwayListener: Function | null;
    scrollListener: any | null;
    keyboardListener: any | null;
}

function hasScrolled(): boolean {
    return document.body.scrollTop > 370 || document.documentElement.scrollTop > 370;
}

export default Vue.extend({
    components: {
        MoviesGrid,
        MarkdownContent,
    },
    props: {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            default: null,
        },
        searchIndex: {
            type: Array as () => SearchIndex,
            required: true,
        },
    },
    data: (): Data => ({
        actionsMenuOpen: false,
        showGoTop: hasScrolled(),
        watchedFilter: WatchedFilter.All,
        searchFilter: null,
        removeClickAwayListener: null,
        scrollListener: null,
        keyboardListener: null,
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
        filteredMovies(): Movie[] {
            let filteredIndex = this.searchIndex;

            switch (this.watchedFilter) {
                case WatchedFilter.Watched:
                    filteredIndex = filteredIndex.filter(entry => entry.movie.watched);
                    break;
                case WatchedFilter.WatchLater:
                    filteredIndex = filteredIndex.filter(entry => !entry.movie.watched);
                    break;
            }

            if (this.searching) {
                const filterText = Str.slug(this.searchFilter!, '');

                filteredIndex = filteredIndex.filter(entry => entry.searchableText.includes(filterText));
            }

            return filteredIndex.map(entry => entry.movie);
        },
        collectionQualifier(): string {
            return this.$viewer.isActive ? 'the' : 'your';
        },
    },
    mounted() {
        document.addEventListener('scroll', this.scrollListener = () => this.showGoTop = hasScrolled());
        document.addEventListener('keydown', this.keyboardListener = (event: KeyboardEvent) => {
            if (!this.captureHotKey(event))
                return;

            event.preventDefault();
        });
    },
    destroyed() {
        if (this.scrollListener) {
            document.removeEventListener('scroll', this.scrollListener);
            this.scrollListener = null;
        }

        if (this.keyboardListener) {
            document.removeEventListener('keydown', this.keyboardListener);
            this.keyboardListener = null;
        }
    },
    methods: {
        captureHotKey({ target, key }: KeyboardEvent): boolean {
            if (key.toLowerCase() !== 'f' || DOM.isWritable(target))
                return false;

            this.showFilters();

            return true;
        },
        showFilters() {
            const input = this.$refs.searchFilter as HTMLInputElement;
            const trigger = (this.$refs.filtersTrigger as Vue).$el as HTMLButtonElement;

            if (this.removeClickAwayListener !== null) {
                input.focus();

                return;
            }

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
        goToTop() {
            document.body.scrollTop = 0;
            document.documentElement.scrollTop = 0;
        },
    },
});
</script>

<style lang="scss">
    .movies-browser__header {
        height: calc(theme('fontSize.xl') * theme('lineHeight.tight') + theme('spacing.4') * 2);
    }
</style>
