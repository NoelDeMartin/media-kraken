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
                movies that you've watched have been added to your collection.
            </ImportResultModalItem>
            <ImportResultModalItem
                v-if="pendingMovies.length > 0"
                icon="time"
                icon-class="text-blue-600"
                @inspect="inspectPending"
            >
                <strong class="font-semibold">{{ pendingMovies.length }}</strong>
                movies that you haven't watched yet have been added to your collection.
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
                weren't processed because you cancelled the operation.
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
            let logs = '# Details of imported movies that you\'ve watched\n';
            let counter = 0;

            for (const movie of this.watchedMovies) {
                logs += `${++counter}. ${movie.title}\n`;
            }

            this.$ui.openModal(MarkdownModal, { content: logs });
        },
        inspectPending() {
            let logs = '# Details of imported movies that you haven\'t watched yet\n';
            let counter = 0;

            for (const movie of this.pendingMovies) {
                logs += `${++counter}. ${movie.title}\n`;
            }

            this.$ui.openModal(MarkdownModal, { content: logs });
        },
        inspectIgnored() {
            let logs = '# Details of ignored data\n';
            let counter = 0;

            for (const { reason, data } of this.log.ignored) {
                logs += `${++counter}. ${reason}\n`;
                logs += `<code>${JSON.stringify(data)}</code>\n`;
            }

            this.$ui.openModal(MarkdownModal, { content: logs });
        },
        inspectUnprocessed() {
            let logs = '# Details of unprocessed data\n';
            let counter = 0;

            for (const data of this.log.unprocessed) {
                logs += `${++counter}. <code>${JSON.stringify(data)}</code>\n`;
            }

            this.$ui.openModal(MarkdownModal, { content: logs });
        },
        inspectInvalid() {
            let logs = '# Details of validation errors\n';
            let counter = 0;

            for (const { reasons, data } of this.log.invalid) {
                logs += `${++counter}. ${reasons.join(', ')}\n`;
                logs += `<code>${JSON.stringify(data)}</code>\n`;
            }

            this.$ui.openModal(MarkdownModal, { content: logs });
        },
        inspectFailed() {
            let logs = '# Details of failed imports\n';
            let counter = 0;

            for (const { error, data } of this.log.failed) {
                logs += `${++counter}. ${error.message}<br>`;
                logs += `<a class="text-xs" href="custom:${counter - 1}">inspect in console</a>\n`;
                logs += `<code>${JSON.stringify(data)}</code>\n`;
            }

            this.$ui.openModal(MarkdownModal, {
                content: logs,
                handleCustomTrigger: (index: string) => {
                    // eslint-disable-next-line no-console
                    console.error(this.log.failed[parseInt(index)].error);
                },
            });
        },
    },
});
</script>
