<template>
    <div v-if="movie" class="mt-6">
        <div class="flex">
            <MoviePoster class="w-64 rounded shadow flex-shrink-0 mr-4" :url="movie.posterUrl" />
            <div class="flex flex-col">
                <h1 class="text-2xl font-semibold mb-1">
                    {{ movie.title }}
                    <span v-if="movie.releaseDate" class="font-medium text-lg">
                        ({{ movie.releaseDate.getFullYear() }})
                    </span>
                </h1>
                <div class="text-sm mb-3">
                    <component
                        :is="movie.watched ? 'div' : 'button'"
                        class="group leading-normal"
                        v-bind="movie.watched ? {} : { type: 'button' }"
                        v-on="movie.watched ? {} : { click: markWatched }"
                    >
                        <div
                            class="flex items-center"
                            :class="{
                                'text-green-700': movie.watched,
                                'text-blue-700 group-hover:text-green-700': movie.pending,
                            }"
                        >
                            <template v-if="movie.pending">
                                <BaseIcon
                                    name="time"
                                    class="w-3 h-3 mr-1 group-hover:hidden"
                                />
                                <span class="group-hover:hidden">pending</span>
                            </template>

                            <BaseIcon
                                name="checkmark"
                                class="w-3 h-3 mr-1"
                                :class="{ 'hidden group-hover:block': movie.pending }"
                            />
                            <span :class="{ 'hidden group-hover:block': movie.pending }">watched</span>
                        </div>
                    </component>
                </div>
                <p class="leading-relaxed text-gray-700">
                    {{ movie.description || 'No description.' }}
                </p>
            </div>
        </div>
    </div>
    <NotFound v-else />
</template>

<script lang="ts">
import Vue from 'vue';
import { Dayjs } from 'dayjs';

import Movie from '@/models/soukai/Movie';

import MoviePoster from '@/components/MoviePoster.vue';
import NotFound from '@/components/NotFound.vue';

export default Vue.extend({
    components: {
        MoviePoster,
        NotFound,
    },
    props: {
        movieUuid: {
            type: String,
            required: true,
        },
    },
    computed: {
        movie(): Movie | null {
            return this.$media.movies.find(movie => movie.uuid === this.movieUuid) || null;
        },
    },
    methods: {
        async markWatched() {
            if (!this.movie || this.movie.watched)
                return;

            await this.$ui.updateModel(this.movie, movie => movie.watch());
        },
    },
});
</script>
