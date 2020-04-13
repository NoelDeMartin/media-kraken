<template>
    <div v-if="movie">
        <div class="flex flex-col mb-4 desktop:flex-row">
            <div class="relative -mx-4 px-4 py-2 desktop:py-0">
                <div class="absolute inset-0 opacity-gradient-top desktop:hidden">
                    <div class="absolute inset-0 bg-gray-300" />
                    <div
                        v-if="movie.posterUrl"
                        class="absolute inset-0 opacity-75 bg-cover"
                        :style="{
                            filter: 'blur(.5px)',
                            backgroundImage: `url('${movie.posterUrl}')`,
                        }"
                    />
                    <BaseIcon
                        v-else
                        name="photo"
                        class="
                            absolute inset-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/3 h-auto
                            text-gray-500
                        "
                    />
                </div>
                <MoviePoster
                    class="w-24 rounded shadow flex-shrink-0 mr-4 desktop:w-64"
                    :class="{ 'opacity-0 desktop:opacity-100': !movie.posterUrl }"
                    :url="movie.posterUrl"
                />
            </div>
            <div class="flex flex-col flex-grow">
                <h1 class="text-2xl font-semibold mb-1 mt-2 desktop:mt-0">
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
                                <span class="group-hover:hidden">watch later</span>
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
                <ul v-if="externalModels" class="flex items-center justify-end mt-4">
                    <li v-for="externalModel of externalModels" :key="externalModel.domain" class="mr-2">
                        <a :href="externalModel.url" target="_blank">
                            <BaseIcon
                                v-if="externalModel.icon"
                                :name="externalModel.icon"
                                class="h-5 w-auto"
                            />
                            <span v-else class="text-sm text-primary-700 hover:underline hover:text-primary-900">
                                view at {{ externalModel.domain }}
                            </span>
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    </div>
    <NotFound v-else />
</template>

<script lang="ts">
import Vue from 'vue';

import Url from '@/utils/Url';

import Movie from '@/models/soukai/Movie';

import MoviePoster from '@/components/MoviePoster.vue';
import NotFound from '@/components/NotFound.vue';

interface ExternalModel {
    url: string;
    domain: string;
    icon: string | null;
}

const DOMAIN_ICONS: { [domain: string]: string } = {
    'imdb.com': 'imdb',
    'themoviedb.org': 'tmdb',
};

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
        externalModels(): ExternalModel[] | null {
            if (!this.movie)
                return null;

            return this.movie.externalUrls.map(url => {
                const domain = Url.parseRootDomain(url) as string;

                return {
                    url,
                    domain,
                    icon: DOMAIN_ICONS[domain] || null,
                };
            });
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
