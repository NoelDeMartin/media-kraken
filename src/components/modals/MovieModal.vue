<template>
    <AppModal :id="id" :options="options" :header="false">
        <div class="flex flex-col overflow-hidden desktop:flex-row">
            <img
                v-if="movie.posterUrl"
                :src="movie.posterUrl"
                class="h-64 max-h-full mr-4 border border-gray-400 hidden desktop:block"
            >
            <div class="flex flex-col max-h-full">
                <div class="flex items-center mb-2">
                    <h2 class="text-xl font-semibold">
                        {{ movie.title }}
                        <span v-if="movie.releaseDate" class="font-medium text-base">
                            ({{ movie.releaseDate.year() }})
                        </span>
                    </h2>
                    <div class="flex-grow" />
                    <button
                        type="button"
                        class="p-2 rounded-lg self-start hover:bg-gray-300 desktop:self-center"
                        @click="$ui.closeModal(id)"
                    >
                        <BaseIcon name="close" class="w-4 h-4 text-gray-800" />
                    </button>
                </div>
                <img
                    v-if="movie.posterUrl"
                    :src="movie.posterUrl"
                    class="h-64 self-start mb-2 border border-gray-400 desktop:hidden"
                >
                <p v-if="movie.description" class="text-sm text-gray-700 mb-2 leading-relaxed overflow-y-auto">
                    {{ movie.description }}
                </p>
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
                            @click="addToCollection(false)"
                        >
                            pending
                        </BaseButton>
                        <BaseButton
                            icon="checkmark"
                            class="bg-green-500 text-white mr-2 hover:bg-green-700"
                            text-class="font-semibold text-sm"
                            icon-class="w-4 h-4 mr-2"
                            @click="addToCollection(true)"
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
import Modal from '@/components/mixins/Modal';

import ThirdPartyMovie from '@/models/third-party/ThirdPartyMovie';

export default Modal.extend({
    props: {
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
                `Adding **${this.movie.title}** to your collection...`,
            );

            this.$ui.showSnackbar(
                `**${this.movie.title}** has been added to your collection!`,
                { transient: true },
            );
        },
    },
});
</script>
