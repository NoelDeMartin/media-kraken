<template>
    <AppModal
        :id="id"
        :options="options"
        class="w-full"
        title="Import from IMDB"
    >
        <p class="mb-4 text-sm text-gray-700 leading-relaxed">
            Introduce a text with as many movie urls from
            <BaseLink href="https://www.imdb.com">
                imdb.com
            </BaseLink> as you like and they will be added to your collection!
        </p>
        <textarea
            v-model="text"
            rows="10"
            class="rounded shadow-xs p-2 bg-blue-100 border border-blue-200 mb-4 focus:border-blue-300"
        />
        <BaseButton class="bg-blue-500 text-white font-semibold justify-center hover:bg-blue-700" @click="submit">
            IMPORT
        </BaseButton>
    </AppModal>
</template>

<script lang="ts">
import Modal from '@/components/mixins/Modal';

export default Modal.extend({
    data: () => ({ text: '' }),
    methods: {
        submit() {
            let match;
            const data = [];
            const text = this.text.slice(0);
            const regex = /https?:\/\/(www\.)?imdb\.com\/title\/([a-zA-Z0-9]+)/g;

            while((match = regex.exec(text))) {
                data.push({ imdb: match[2] });
            }

            this.$ui.resolveModal(this.id, data);
        },
    },
});
</script>
