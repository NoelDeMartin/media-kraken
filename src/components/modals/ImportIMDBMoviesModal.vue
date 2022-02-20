<template>
    <AppModal
        :id="id"
        :options="options"
        class="w-full"
        title="Import from IMDb"
    >
        <p class="mb-3 text-gray-700 leading-relaxed">
            At the moment, importing data from IMDb is limited given their <BaseLink url="https://www.imdb.com/interfaces/">
                lack of APIs
            </BaseLink>.
        </p>
        <p class="mb-4 text-gray-700 leading-relaxed">
            For now, you can introduce a text containing movie urls from imdb.com and they will be
            added to your collection.
        </p>
        <textarea
            v-model="text"
            rows="10"
            class="
                rounded shadow-xs p-2 bg-blue-100 border border-blue-200 placeholder-gray-600
                mb-4 focus:border-blue-300
            "
            :placeholder="textareaPlaceholder"
        />
        <BaseButton class="bg-blue-500 text-white font-semibold justify-center hover:bg-blue-700" @click="submit">
            Import Movies
        </BaseButton>
    </AppModal>
</template>

<script lang="ts">
import Modal from '@/components/mixins/Modal';

export default Modal.extend({
    data: () => ({ text: '' }),
    computed: {
        textareaPlaceholder(): string {
            return [
                'Examples of valid urls:',
                '  - https://www.imdb.com/title/tt0245429',
                '  - https://m.imdb.com/title/tt0245429',
                '  - https://imdb.com/title/tt0245429',
                '  - http://imdb.com/title/tt0245429',
                '  - ...',
            ].join('\n');
        },
    },
    methods: {
        submit() {
            let match;
            const data = [];
            const text = this.text.slice(0);
            const regex = /https?:\/\/(www\.)?(m\.)?imdb\.com\/title\/([a-zA-Z0-9]+)/g;

            while((match = regex.exec(text))) {
                data.push({ imdb: match[3] });
            }

            this.$ui.resolveModal(this.id, data);
        },
    },
});
</script>
