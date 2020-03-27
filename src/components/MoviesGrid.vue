<template>
    <BaseTransitionGroup
        animation="fade"
        class="relative grid grid-cols-fill-32 gap-3 desktop:grid-cols-fill-40"
        @before-leave="sendMovieToCollection"
    >
        <MoviesGridItem
            v-for="movie of movies"
            :key="movie.id"
            :movie="movie"
            class="list-complete-item"
        />
    </BaseTransitionGroup>
</template>

<script lang="ts">
import Vue from 'vue';

import Movie from '@/models/soukai/Movie';

import MoviesGridItem from '@/components/MoviesGridItem.vue';

export default Vue.extend({
    components: {
        MoviesGridItem,
    },
    props: {
        movies: {
            type: Array as () => Movie[],
            required: true,
        },
    },
    methods: {
        sendMovieToCollection(el: HTMLElement) {
            const { clientWidth, offsetTop, offsetLeft } = el;

            el.style.position = 'absolute';
            el.style.width = `${clientWidth}px`;

            if (!this.$ui.mobile) {
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
        transform: scale(.01) translate(-50%, -50%);
        transform-origin: top left;
    }
</style>
