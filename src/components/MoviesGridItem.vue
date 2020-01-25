<template>
    <a
        :href="movie.externalUrl"
        :style="{
            'background-image': `url('${movie.posterUrl}')`,
        }"
        class="
            flex flex-col justify-end items-end
            bg-cover bg-center
            w-40 h-40 flex items-end overflow-hidden m-2
            border border-gray-600 rounded-lg
            hover:opacity-75
        "
        target="_blank"
    >
        <div v-if="movie.watched" class="flex items-center px-2 py-1 m-1 bg-green-300 rounded-full text-green-800">
            <span class="font-semibold text-xs mr-1">Watched</span>
            <Icon name="checkmark" />
        </div>
        <div v-else class="flex items-center px-2 py-1 m-1 bg-blue-300 rounded-full text-blue-800">
            <span class="font-semibold text-xs mr-1">Pending</span>
            <Icon name="time" />
        </div>
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
