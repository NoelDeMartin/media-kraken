<template>
    <div>
        <LazyArea
            v-for="(chunk, chunkIndex) of movieChunks"
            :key="chunkIndex"
            :force-visible="chunk.forceVisible"
            :class="chunk.wrapperClass"
        >
            <div slot="placeholder" :style="chunk.placeholderStyle" />

            <BaseTransitionGroup
                animation="fade"
                class="relative grid grid-cols-fill-32 gap-3 desktop:grid-cols-fill-40"
                @before-leave="sendMovieToCollection"
            >
                <MoviesGridItem
                    v-for="movie of chunk.movies"
                    :key="movie.id"
                    :movie="movie"
                    class="list-complete-item"
                />
            </BaseTransitionGroup>
        </LazyArea>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

import DOM from '@/utils/DOM';

import Movie from '@/models/soukai/Movie';

import { screenBreakpoints } from '@/services/UI';

import LazyArea from '@/components/LazyArea.vue';
import MoviesGridItem from '@/components/MoviesGridItem.vue';

interface Data {
    grid: GridMeasurements;
    $_resizeListener?: any;
}

interface MoviesChunk {
    movies: Movie[];
    forceVisible: boolean;
    wrapperClass: string;
    placeholderStyle: string;
}

interface GridMeasurements {
    cellsHeight: number;
    gapSize: number;
    columns: number;
}

const CHUNK_ROWS = 4;

function measureGrid(parent: Element, desktop: boolean, addPadding: boolean = false): GridMeasurements {
    const tailwindMeasures = {
        'gap-3': DOM.measurePixels('.75rem', parent),
        'px-4': DOM.measurePixels('1rem', parent),
        'grid-cols-fill-32': DOM.measurePixels('8rem', parent),
        'grid-cols-fill-40': DOM.measurePixels('10rem', parent),
        'max-w-content': 900,
        'border': 1,
    };

    const maxGridWidth = tailwindMeasures['max-w-content'];
    const minCellWidth = tailwindMeasures[desktop ? 'grid-cols-fill-40' : 'grid-cols-fill-32'];
    const gapSize = tailwindMeasures['gap-3'];
    const gridWidth = Math.min(parent.clientWidth, maxGridWidth) - (addPadding ? (tailwindMeasures['px-4'] * 2) : 0);
    const columns = Math.floor((gridWidth + gapSize) / (minCellWidth + gapSize));
    const cellsWidth = (gridWidth - (columns - 1) * gapSize) / columns;
    const imageBorders = tailwindMeasures['border'] * 2;
    const cellsHeight = (cellsWidth - imageBorders) * 3 / 2 + imageBorders;

    return { cellsHeight, gapSize, columns };
}

export default Vue.extend({
    components: {
        LazyArea,
        MoviesGridItem,
    },
    props: {
        movies: {
            type: Array as () => Movie[],
            required: true,
        },
        withinCollection: {
            type: Boolean,
            default: false,
        },
    },
    data(): Data {
        return {
            grid: measureGrid(
                document.body,
                window.matchMedia(`(min-width: ${screenBreakpoints.desktop}px)`).matches,
                true,
            ),
        };
    },
    computed: {
        movieChunks(): MoviesChunk[] {
            const chunks = [];
            const totalMovies = this.movies.length;
            const chunkSize = this.grid.columns * CHUNK_ROWS;

            for (let offset = 0; totalMovies > offset; offset += chunkSize) {
                const movies = this.movies.slice(offset, offset + chunkSize);
                const rows = Math.ceil(movies.length / this.grid.columns);
                const placeholderHeight = this.grid.cellsHeight * rows + this.grid.gapSize * (rows-1);

                chunks.push({
                    movies,
                    forceVisible: offset === 0,
                    wrapperClass: offset === 0 ? '' : 'mt-3',
                    placeholderStyle: `height:${placeholderHeight}px`,
                });
            }

            return chunks;
        },
    },
    mounted() {
        this.$_resizeListener = () => this.grid = measureGrid(this.$el, this.$ui.desktop);
        this.$_resizeListener();

        window.addEventListener('resize', this.$_resizeListener);
    },
    destroyed() {
        if (!this.$_resizeListener)
            return;

        window.removeEventListener('resize', this.$_resizeListener);

        delete this.$_resizeListener;
    },
    methods: {
        sendMovieToCollection(el: HTMLElement) {
            const { clientWidth, offsetTop, offsetLeft } = el;

            el.style.position = 'absolute';
            el.style.width = `${clientWidth}px`;

            if (!this.withinCollection && !this.$ui.mobile) {
                this.positionAtMyCollection(el);
                el.classList.add('sending-to-collection');

                return;
            }

            el.style.top = `${offsetTop}px`;
            el.style.left = `${offsetLeft}px`;
        },
        positionAtMyCollection(el: HTMLElement) {
            const myCollection = this.$ui.myCollectionElement;

            if (myCollection === null)
                return;

            const myCollectionRect = myCollection.getBoundingClientRect();
            const gridRect = this.$el.getBoundingClientRect();
            const top = myCollectionRect.top - gridRect.top + myCollection.clientHeight/2;
            const left = myCollectionRect.left - gridRect.left + myCollection.clientWidth/2;

            el.style.top = `${top}px`;
            el.style.left = `${left}px`;
        },
    },
});
</script>

<style lang="scss">
    .sending-to-collection {
        transform: scale(.1) translate(-50%, -50%);
        transform-origin: top left;
    }
</style>
