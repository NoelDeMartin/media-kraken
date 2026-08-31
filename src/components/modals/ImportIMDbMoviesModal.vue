<template>
    <Modal wrapper-class="sm:max-w-lg" class="p-6">
        <HeadlessModalTitle class="text-xl font-semibold text-gray-900">
            {{ $t('movies.importModals.imdb.title') }}
        </HeadlessModalTitle>
        <p class="mt-2 text-sm text-gray-600">
            {{ $t('movies.importModals.imdb.description') }}
        </p>
        <textarea
            v-model="text"
            rows="8"
            class="mt-4 w-full rounded-md border border-slate-300 p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            :placeholder="placeholder"
        />
        <div class="mt-4 flex justify-end gap-2">
            <Button variant="outline" @click="close()">
                {{ $t('movies.importModals.cancel') }}
            </Button>
            <Button class="bg-blue-600 text-white hover:bg-blue-700" :disabled="!text.trim()" @click="submit">
                {{ $t('movies.importModals.imdb.submit') }}
            </Button>
        </div>
    </Modal>
</template>

<script setup lang="ts">
import { useModal } from '@aerogel/core';
import { ref } from 'vue';

const text = ref('');
const { close } = useModal<{ imdb: string }[]>();

const placeholder = [
    'Examples of valid urls:',
    '  - https://www.imdb.com/title/tt0245429',
    '  - https://m.imdb.com/title/tt0245429',
    '  - https://imdb.com/title/tt0245429',
].join('\n');

function submit() {
    let match: RegExpExecArray | null;
    const data: { imdb: string }[] = [];
    const regex = /https?:\/\/(www\.)?(m\.)?imdb\.com\/title\/([a-zA-Z0-9]+)/g;

    while ((match = regex.exec(text.value)) !== null) {
        data.push({ imdb: match[3] });
    }

    close(data);
}
</script>
