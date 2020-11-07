<template>
    <AppModal :id="id" :options="options" title="Import completed">
        <ul class="flex flex-col items-start">
            <ImportResultModalItem
                v-if="watchedMovies.length > 0"
                icon="checkmark"
                icon-class="text-green-600"
                @inspect="inspectWatched"
            >
                <strong class="font-semibold">{{ watchedMovies.length }}</strong>
                watched movies have been added to your collection.
            </ImportResultModalItem>
            <ImportResultModalItem
                v-if="pendingMovies.length > 0"
                icon="time"
                icon-class="text-blue-600"
                @inspect="inspectPending"
            >
                <strong class="font-semibold">{{ pendingMovies.length }}</strong>
                movies have been added to your collection to watch later.
            </ImportResultModalItem>
            <ImportResultModalItem
                v-if="log.ignored.length > 0"
                icon="info"
                icon-class="text-blue-600"
                @inspect="inspectIgnored"
            >
                <strong class="font-semibold">{{ log.ignored.length }}</strong> were ignored.
            </ImportResultModalItem>
            <ImportResultModalItem
                v-if="log.unprocessed.length > 0"
                icon="info"
                icon-class="text-blue-600"
                @inspect="inspectUnprocessed"
            >
                <strong class="font-semibold">{{ log.unprocessed.length }}</strong>
                weren't processed because you stopped the operation.
            </ImportResultModalItem>
            <ImportResultModalItem
                v-if="log.invalid.length > 0"
                icon="error"
                icon-class="text-red-600"
                @inspect="inspectInvalid"
            >
                <strong class="font-semibold">{{ log.invalid.length }}</strong> contained validation errors.
            </ImportResultModalItem>
            <ImportResultModalItem
                v-if="log.failed.length > 0"
                icon="error"
                icon-class="text-red-600"
                @inspect="inspectFailed"
            >
                <strong class="font-semibold">{{ log.failed.length }}</strong> failed on import.
            </ImportResultModalItem>
        </ul>
        <BaseButton
            class="bg-primary-500 text-white self-center justify-center w-24 hover:bg-primary-700"
            @click="close(true)"
        >
            OK
        </BaseButton>
    </AppModal>
</template>

<script lang="ts">
import Movie from '@/models/soukai/Movie';

import { ImportOperationLog } from '@/services/Media';

import Markdown from '@/utils/Markdown';

import ErrorInfoModal from '@/components/modals/ErrorInfoModal.vue';
import ImportResultModalItem from '@/components/modals/ImportResultModalItem.vue';
import MarkdownModal from '@/components/modals/MarkdownModal.vue';
import Modal from '@/components/mixins/Modal';

export default Modal.extend({
    components: {
        ImportResultModalItem,
    },
    props: {
        log: {
            type: Object as () => ImportOperationLog,
            required: true,
        },
    },
    computed: {
        watchedMovies(): Movie[] {
            return this.log.added.filter(movie => movie.watched);
        },
        pendingMovies(): Movie[] {
            return this.log.added.filter(movie => !movie.watched);
        },
    },
    methods: {
        inspectWatched() {
            let counter = 0;
            const logs = ['# These movies have been imported as watched'];

            for (const movie of this.watchedMovies) {
                logs.push(`${++counter}. ${movie.title}`);
            }

            this.$ui.openModal(MarkdownModal, { content: logs.join('\n') });
        },
        inspectPending() {
            let counter = 0;
            const logs = ['# These movies have been imported to watch later'];

            for (const movie of this.pendingMovies) {
                logs.push(`${++counter}. ${movie.title}`);
            }

            this.$ui.openModal(MarkdownModal, { content: logs.join('\n') });
        },
        inspectIgnored() {
            let counter = 0;
            const logs = ['# The following movies have been ignored'];

            for (const { reason, data } of this.log.ignored) {
                logs.push(`${++counter}. ${reason}`);
                logs.push(Markdown.codeBlock(JSON.stringify(data)));
            }

            this.$ui.openModal(MarkdownModal, { content: logs.join('\n') });
        },
        inspectUnprocessed() {
            let counter = 0;
            const logs = ['# The following movies have not been processed'];

            for (const data of this.log.unprocessed) {
                logs.push(`${++counter}. `);
                logs.push(Markdown.codeBlock(JSON.stringify(data)));
            }

            this.$ui.openModal(MarkdownModal, { content: logs.join('\n') });
        },
        inspectInvalid() {
            let counter = 0;
            const logs = ['# The following items were not valid movies'];

            for (const { reasons, data } of this.log.invalid) {
                logs.push(`${++counter}. ${reasons.join(', ')}`);
                logs.push(Markdown.codeBlock(JSON.stringify(data)));
            }

            this.$ui.openModal(MarkdownModal, { content: logs.join('\n') });
        },
        inspectFailed() {
            let counter = 0;
            const logs = ['# The following movies caused some errors'];

            for (const { data } of this.log.failed) {
                logs.push(
                    `${++counter}. An unexpected error ocurred parsing this — `+
                        `<a href="custom:${counter - 1}">view details</a>`,
                );
                logs.push(Markdown.codeBlock(JSON.stringify(data)));
            }

            this.$ui.openModal(MarkdownModal, {
                content: logs.join('\n'),
                handleCustomTrigger: (index: string) => {
                    this.$ui.openModal(ErrorInfoModal, { error: this.log.failed[parseInt(index)].error });
                },
            });
        },
    },
});
</script>
