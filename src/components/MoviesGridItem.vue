<template>
    <div class="movies-grid-item relative">
        <button
            v-if="$viewer.isActive"
            :title="linkTitle"
            class="block w-full h-auto group"
            @click="$viewer.setMovie(movie)"
        >
            <MoviePoster :url="movie.posterUrl" :title="movie.title" />
            <div class="absolute inset-0 bg-black opacity-0 group-hover:opacity-25" />
        </button>
        <template v-else>
            <router-link
                :to="{ name: 'movie', params: { uuid: movie.uuid } }"
                :title="linkTitle"
                :aria-label="linkTitle"
                class="block group"
            >
                <MoviePoster :url="movie.posterUrl" :title="movie.title" />
                <div class="absolute inset-0 bg-black opacity-0 group-hover:opacity-25" />
            </router-link>
            <component
                :is="movie.watched ? 'div' : 'button'"
                v-if="!$viewer.isActive"
                class="badge absolute top-0 right-0 -mt-1 w-10 h-10 flex items-center justify-center"
                style="margin-right:-.7rem"
                :title="movie.watched ? null : 'Mark watched'"
                :aria-label="movie.watched ? null : `Mark ${movie.title} as watched`"
                v-bind="movie.watched ? { class: 'watched' } : { type: 'button' }"
                @click="movie.pending && markWatched($event)"
            >
                <BaseIcon name="bookmark" class="background absolute inset-0 w-10 h-10" />
                <BaseIcon v-if="movie.pending" name="time" class="icon-pending text-blue-600 w-4 h-4 z-10" />
                <BaseIcon name="checkmark" class="icon-watched text-green-600 w-4 h-4 z-10" />
            </component>
        </template>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

import Movie from '@/models/soukai/Movie';

import MoviePoster from '@/components/MoviePoster.vue';

export default Vue.extend({
    components: {
        MoviePoster,
    },
    props: {
        movie: {
            type: Movie,
            required: true,
        },
    },
    computed: {
        linkTitle(): string {
            if (this.$viewer.isActive)
                return this.movie.title;

            const status = this.movie.watched ? 'Watched' : 'Watch later';

            return `${this.movie.title} (${status})`;
        },
    },
    methods: {
        async markWatched(e: Event) {
            if (this.movie.watched)
                return;

            e.preventDefault();

            await this.$ui.updateModel(this.movie, movie => movie.watch());
        },
    },
});
</script>

<style lang="scss">
    .movies-grid-item {

        .badge {

            .background {
                @apply text-blue-300;
            }

            .icon-watched {
                @apply hidden;
            }

            &:hover, &.watched {

                .background {
                    @apply text-green-300;
                }

                .icon-watched {
                    @apply block;
                }

                .icon-pending {
                    @apply hidden;
                }

            }

        }

    }
</style>
