<template>
    <AppModal @close="$ui.closeModal(id)">
        <div class="flex flex-col desktop:flex-row">
            <img
                v-if="movie.posterUrl"
                :src="movie.posterUrl"
                class="h-64 max-h-full mr-4 border border-gray-400 hidden desktop:block"
            >
            <div class="flex flex-col max-h-full">
                <span class="text-xl font-semibold mb-2">{{ movie.title }}</span>
                <img
                    v-if="movie.posterUrl"
                    :src="movie.posterUrl"
                    class="h-64 self-start mb-2 border border-gray-400 desktop:hidden"
                >
                <p v-if="movie.data.overview" class="text-sm text-gray-700 mb-2 leading-relaxed overflow-y-auto">
                    {{ movie.data.overview }}
                </p>
                <div class="flex-grow" />
                <div class="flex justify-end flex-col desktop:flex-row desktop:items-center">
                    <p class="text-sm font-medium ml-0 m-2 desktop:my-0">
                        Add it to your collection:
                    </p>
                    <div class="flex">
                        <button
                            class="
                                flex items-center rounded-full shadow border border-blue-700
                                text-sm font-medium text-blue-100 bg-blue-600 hover:bg-blue-700
                                px-2 h-8 mr-2
                            "
                            @click="addToCollection(false)"
                        >
                            <BaseIcon name="time" class="w-4 h-4 mr-2" />
                            <span class="mr-1">pending</span>
                        </button>
                        <button
                            class="
                                flex items-center rounded-full shadow border border-green-700
                                text-sm font-medium text-green-100 bg-green-600 hover:bg-green-700
                                px-2 h-8
                            "
                            @click="addToCollection(true)"
                        >
                            <BaseIcon name="checkmark" class="w-4 h-4 mr-2" />
                            <span class="mr-1">watched</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </AppModal>
</template>

<script lang="ts">
import Vue from 'vue';

import ThirdPartyMovie from '@/models/third-party/ThirdPartyMovie';

import AppModal from '@/components/AppModal.vue';

export default Vue.extend({
    components: {
        AppModal,
    },
    props: {
        id: {
            type: String,
            required: true,
        },
        movie: {
            type: Object as () => ThirdPartyMovie,
            required: true,
        },
    },
    methods: {
        async addToCollection(watched: boolean) {
            this.$ui.closeModal(this.id);

            const movie = await this.$ui.loading(
                async () => {
                    const movie = await this.$media.importMovie(this.movie);

                    if (watched) {
                        await movie.watch();
                    }

                    return movie;
                },
                `Importing ${this.movie.title}...`,
            );

            this.$router.push({ name: 'movie', params: { uuid: movie.uuid! }});
        },
    },
});
</script>
