<template>
    <main>
        <div id="collection-page-header" class="relative flex items-center -mx-2">
            <BaseTransition
                :enter-duration="150"
                :leave-duration="75"
                animation="fade"
                enter-active-class="delay-75"
            >
                <div v-if="!$ui.mobile || !filtering" class="flex items-center">
                    <BaseMenu
                        v-slot="{ toggle: toggleActionsMenu }"
                        :options="[
                            { text: 'Import to collection', icon: 'upload', handle: importMedia },
                            { text: 'Export collection', icon: 'download', handle: exportCollection },
                        ]"
                    >
                        <BaseButton
                            icon="more"
                            class="h-8 mr-1 hover:bg-black-overlay"
                            style="padding:0; width:1.125rem"
                            @click="toggleActionsMenu"
                        />
                    </BaseMenu>
                    <BasePageHeader>Collection ({{ filteredMovies.length }})</BasePageHeader>
                </div>
            </BaseTransition>
            <div class="absolute text-right right-0 top-1/2 transform -translate-y-1/2 px-2 w-full desktop:w-64">
                <BaseTransition :duration="150" animations="fade resize-width">
                    <input
                        v-show="filtering"
                        ref="filter"
                        v-model="filter"
                        placeholder="Filter movies..."
                        class="
                            w-full text-sm py-1 bg-transparent appearance-none border-b-2 border-primary-200
                            focus:border-primary-300
                        "
                        @keyup.esc="filter = ''"
                    >
                </BaseTransition>
            </div>
            <BaseTransition :duration="100" animation="fade">
                <BaseButton
                    v-show="!filtering"
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
        </div>
        <BaseTransitionGroup :duration="100" animation="fade" class="relative">
            <MoviesGrid
                v-if="filteredMovies.length > 0"
                key="movies"
                within-collection
                :movies="filteredMovies"
            />
            <div v-else key="empty" class="absolute flex items-center justify-center h-24 top-0 inset-x-0">
                <span class="text-lg">Nothing matches "{{ filter }}"</span>
            </div>
        </BaseTransitionGroup>
    </main>
</template>

<script lang="ts">
import Vue from 'vue';

import Str from '@/utils/Str';

import Movie from '@/models/soukai/Movie';

import ImportOptionsModal from '@/components/modals/ImportOptionsModal.vue';
import MoviesGrid from '@/components/MoviesGrid.vue';

interface Data {
    filter: string | null;
    removeClickAwayListener: Function | null;
}

export default Vue.extend({
    components: {
        MoviesGrid,
    },
    data: (): Data => ({
        filter: null,
        removeClickAwayListener: null,
    }),
    computed: {
        filtering(): boolean {
            return this.removeClickAwayListener !== null;
        },
        allMovies(): Movie[] {
            return this.$media.movies
                .slice(0)
                .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        },
        filteredMovies(): Movie[] {
            if (!this.filtering)
                return this.allMovies;

            const filterText = Str.slug(this.filter!, '');

            return this.allMovies.filter(movie => Str.contains(Str.slug(movie.title, ''), filterText));
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

            const input = this.$refs.filter as HTMLInputElement;
            const trigger = (this.$refs.filtersTrigger as Vue).$el as HTMLButtonElement;

            this.filter = '';
            this.removeClickAwayListener = this.$ui.onClickAway(
                [input, trigger],
                () => this.filter!.length === 0 && this.hideFilters(),
            );

            this.$nextTick(() => input.focus());
        },
        hideFilters() {
            if (this.removeClickAwayListener === null)
                return;

            this.removeClickAwayListener();

            this.filter = null;
            this.removeClickAwayListener = null;
        },
        importMedia() {
            this.$ui.openModal(ImportOptionsModal);
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
