<template>
    <a
        :href="movie.externalUrl"
        :style="{
            'background-image': `url('${movie.posterUrl}')`,
        }"
        class="
            bg-cover bg-center
            w-40 h-40 flex items-end overflow-hidden m-2
            border border-gray-600 rounded-lg
            hover:opacity-75
        "
        target="_blank"
    >
        <div class="opacity-75 bg-black p-2 w-full">
            <span class="block font-semibold text-white tracking-wider truncate">
                {{ movie.title }}
            </span>
        </div>
    </a>
</template>

<script lang="ts">
import Vue from 'vue';

import Movie from '@/models/Movie';

export default Vue.extend({
    props: {
        movie: {
            type: Movie,
            required: true,
        },
    },
});
</script>
