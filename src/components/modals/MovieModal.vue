<template>
    <AppModal :id="id" :options="options" :fullscreen="$ui.mobile">
        <div class="flex flex-col flex-grow desktop:flex-row">
            <div v-if="movie.posterUrl" class="relative -mx-4 -mt-4 mb-2 p-4 desktop:m-0 desktop:p-0">
                <template v-if="$ui.mobile">
                    <button
                        type="button"
                        class="absolute top-0 right-0 m-4 p-2 rounded-full z-10 bg-white-overlay"
                        @click="close"
                    >
                        <BaseIcon name="close" class="w-4 h-4 text-gray-800" />
                    </button>
                    <div class="absolute inset-0 opacity-gradient-top">
                        <div class="absolute inset-0 bg-gray-300" />
                        <div
                            class="absolute inset-0 opacity-75 bg-cover"
                            :style="{
                                filter: 'blur(.5px)',
                                backgroundImage: `url('${movie.posterUrl}')`,
                            }"
                        />
                    </div>
                </template>
                <MoviePoster
                    class="w-24 rounded shadow flex-shrink-0 mr-4 desktop:w-64"
                    :url="movie.posterUrl"
                />
            </div>
            <div class="flex flex-col flex-grow max-h-full">
                <div class="flex items-center mb-2">
                    <h2 class="text-xl font-semibold">
                        {{ movie.title }}
                        <span v-if="movie.releaseDate" class="font-medium text-base">
                            ({{ movie.releaseDate.getFullYear() }})
                        </span>
                    </h2>
                    <div class="flex-grow" />
                    <button
                        v-if="$ui.desktop || !movie.posterUrl"
                        type="button"
                        class="p-2 rounded-lg self-start hover:bg-gray-300 desktop:self-center"
                        @click="close"
                    >
                        <BaseIcon name="close" class="w-4 h-4 text-gray-800" />
                    </button>
                </div>
                <p v-if="movie.description" class="text-sm text-gray-700 mb-2 leading-relaxed overflow-y-auto">
                    {{ movie.description }}
                </p>
                <ul v-if="externalModels" class="flex items-center justify-end mt-4">
                    <li v-for="externalModel of externalModels" :key="externalModel.domain" class="mr-2">
                        <a :href="externalModel.url" target="_blank">
                            <BaseIcon
                                v-if="externalModel.icon"
                                :name="externalModel.icon"
                                class="w-auto h-5"
                            />
                            <span v-else class="text-sm text-primary-700 hover:underline hover:text-primary-900">
                                view at {{ externalModel.domain }}
                            </span>
                        </a>
                    </li>
                </ul>
                <div class="flex-grow" />
                <div class="flex justify-end flex-col desktop:flex-row desktop:items-center">
                    <p class="text-sm font-medium ml-0 m-2 desktop:my-0">
                        Add it to your collection:
                    </p>
                    <div class="flex">
                        <BaseButton
                            icon="time"
                            class="bg-blue-500 text-white mr-2 hover:bg-blue-700"
                            text-class="font-semibold text-sm"
                            icon-class="w-4 h-4 mr-2"
                            @click="addToCollection(false), close()"
                        >
                            watch later
                        </BaseButton>
                        <BaseButton
                            icon="checkmark"
                            class="bg-green-500 text-white mr-2 hover:bg-green-700"
                            text-class="font-semibold text-sm"
                            icon-class="w-4 h-4 mr-2"
                            @click="addToCollection(true), close()"
                        >
                            watched
                        </BaseButton>
                    </div>
                </div>
            </div>
        </div>
    </AppModal>
</template>

<script lang="ts">
import ModelsCache from '@/models/ModelsCache';
import Movie from '@/models/soukai/Movie';

import Modal from '@/components/mixins/Modal';
import MoviePoster from '@/components/MoviePoster.vue';
import Url from '@/utils/Url';


interface ExternalModel {
    url: string;
    domain: string;
    icon: string | null;
}

const DOMAIN_ICONS: { [domain: string]: string } = {
    'imdb.com': 'imdb',
    'themoviedb.org': 'tmdb',
};

export default Modal.extend({
    components: { MoviePoster },
    props: {
        movie: {
            type: Object as () => Movie,
            required: true,
        },
    },
    computed: {
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
        async addToCollection(watched: boolean) {
            const movie = this.movie;

            await this.$ui.loading(
                async () => {
                    if (watched)
                        await movie.watch();

                    await movie.fetchMissingAttributes();
                    await this.$media.moviesContainer!.relatedMovies.save(movie);
                    await ModelsCache.forgetDocument(this.$media.moviesContainer!.url);
                },
                `Adding **${movie.title}** to your collection...`,
            );

            this.$ui.showSnackbar(
                `[**${movie.title}**](route:/movies/${movie.uuid}) has been added to your collection!`,
                { transient: true },
            );
        },
    },
});
</script>
