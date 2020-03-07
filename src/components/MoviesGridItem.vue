<template>
    <div
        :style="{
            'background-image': `url('${movie.posterUrl}')`,
        }"
        class="
            flex flex-col justify-end items-end
            bg-cover bg-center
            w-40 h-40 flex items-end overflow-hidden m-2
            border border-gray-600 rounded-lg
        "
    >
        <div v-if="movie.watched" class="flex items-center px-2 py-1 m-1 bg-green-300 rounded-full text-green-800">
            <span class="font-semibold text-xs mr-1">Watched</span>
            <BaseIcon name="checkmark" />
        </div>
        <button
            v-else
            type="button"
            class="group"
            @click="movie.watch()"
        >
            <div
                class="
                    flex items-center px-2 py-1 m-1 bg-blue-300 rounded-full text-blue-800
                    group-hover:bg-green-300 group-hover:text-green-800
                "
            >
                <span class="block font-semibold text-xs mr-1 group-hover:hidden">Pending</span>
                <span class="hidden font-semibold text-xs mr-1 group-hover:block">Watch</span>
                <BaseIcon name="time" class="block group-hover:hidden" />
                <BaseIcon name="checkmark" class="hidden group-hover:block" />
            </div>
        </button>
        <div class="opacity-75 bg-black p-2 w-full">
            <router-link
                :to="{ name: 'movie', params: { uuid: movie.uuid } }"
                class="block font-semibold text-white tracking-wider truncate"
            >
                {{ movie.title }}
            </router-link>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

import Movie from '@/models/soukai/Movie';

export default Vue.extend({
    props: {
        movie: {
            type: Movie,
            required: true,
        },
    },
});
</script>
