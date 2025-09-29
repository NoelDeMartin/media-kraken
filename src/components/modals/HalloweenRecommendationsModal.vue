<template>
    <AppModal :id="id" :options="options" title="This Is Halloween 🎃">
        <p class="text-gray-700 leading-relaxed mb-3">
            Not sure what to watch this Halloween season? Here's some recommendations!
        </p>
        <div class="relative grid grid-cols-fill-32 gap-3">
            <div v-for="movie in movies" :key="movie.id" class="relative movies-grid-item">
                <button
                    type="button"
                    class="block w-full h-auto group"
                    :title="movie.title"
                    @click="inspect(movie)"
                >
                    <MoviePoster :url="movie.posterUrl" />
                    <div class="absolute inset-0 bg-black opacity-0 group-hover:opacity-25" />
                </button>
                <component
                    :is="movie.watched ? 'div' : 'button'"
                    v-if="movie.exists()"
                    class="badge absolute top-0 right-0 -mt-1 w-10 h-10 flex items-center justify-center"
                    style="margin-right:-.7rem"
                    :title="movie.watched ? null : 'Mark watched'"
                    :aria-label="movie.watched ? null : `Mark ${movie.title} as watched`"
                    v-bind="movie.watched ? { class: 'watched' } : { type: 'button' }"
                    @click="movie.pending && markWatched(movie, $event)"
                >
                    <BaseIcon name="bookmark" class="background absolute inset-0 w-10 h-10" />
                    <BaseIcon v-if="movie.pending" name="time" class="icon-pending text-blue-600 w-4 h-4 z-10" />
                    <BaseIcon name="checkmark" class="icon-watched text-green-600 w-4 h-4 z-10" />
                </component>
                <button
                    v-else
                    class="absolute top-0 right-0 -mt-1 w-10 h-10 flex items-center justify-center"
                    title="Add to collection"
                    type="button"
                    :aria-label="`Add ${movie.title} to collection`"
                    style="margin-right:-.7rem"
                    @click="addToCollection(movie, $event)"
                >
                    <BaseIcon name="bookmark" class="text-blue-300 absolute inset-0 w-10 h-10" />
                    <BaseIcon name="add" class="icon-pending text-blue-600 w-6 h-6 z-10" />
                </button>
            </div>
        </div>
        <BaseButton
            class="
                border border-primary-500 text-sm text-primary-700 justify-center mt-4
                hover:bg-black-overlay
            "
            @click="importHalloweenMovies(), close()"
        >
            Add all to my collection
        </BaseButton>
    </AppModal>
</template>

<script lang="ts">
import Modal from '@/components/mixins/Modal';
import Movie from '@/models/soukai/Movie';
import MoviesGrid from '@/components/MoviesGrid.vue';
import MoviePoster from '@/components/MoviePoster.vue';
import MovieModal from '@/components/modals/MovieModal.vue';
import halloweenMovies from '@/assets/data/halloween-movies.json';
import JSONLDMoviesParser from '@/utils/parsers/JSONLDMoviesParser';
import ModelsCache from '@/models/ModelsCache';

function shuffle(array: Movie[]): void {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

export default Modal.extend({
    components: { MoviesGrid, MoviePoster },
    data: () => ({ movies: [] as Movie[] }),
    async mounted() {
        const movies = (await Promise.all(halloweenMovies.map(json => JSONLDMoviesParser.parse(json)))).map(movie => {
            const existingMovie = this.$media.movies.find(collectionMovie => collectionMovie.is(movie));

            if (existingMovie) {
                return existingMovie;
            }

            movie.mintUrl();

            return movie;
        });

        shuffle(movies);

        this.movies = movies;
    },
    methods: {
        async inspect(movie: Movie) {
            this.$ui.openModal(MovieModal, { movie });
        },
        async importHalloweenMovies() {
            await this.$ui.loading(
                async () => {
                    await Promise.all(this.movies.map(async movie => {
                        if (movie.exists()) {
                            return;
                        }

                        await movie.fetchMissingAttributes();
                        await this.$media.moviesContainer!.relatedMovies.save(movie);
                    }));

                    await ModelsCache.forgetDocument(this.$media.moviesContainer!.url);
                },
                'Adding **🎃 Halloween movies** to your collection...',
            );

            this.$ui.showSnackbar('🎃 Halloween movies added to your collection!', { transient: true });
        },
        async markWatched(movie: Movie, e: Event) {
            if (movie.watched)
                return;

            e.preventDefault();

            await this.$ui.updateModel(movie, movie => movie.watch());
        },
        async addToCollection(movie: Movie, e: Event) {
            e.preventDefault();

            await this.$ui.loading(
                async () => {
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
