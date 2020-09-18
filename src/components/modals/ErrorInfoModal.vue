<template>
    <AppModal
        :id="id"
        :fullscreen="$ui.mobile"
        :options="options"
        :scrollable="false"
        class="bg-red-600 text-white"
    >
        <div class="flex mb-4 items-center">
            <h2 class="font-semibold text-xl text-red-200">
                {{ title }}
            </h2>
            <div class="flex-grow" />
            <button
                type="button"
                class="p-2 ml-2 -my-2 rounded-lg hover:bg-red-700"
                @click="close(true)"
            >
                <BaseIcon name="close" class="w-4 h-4 text-red-200" />
            </button>
        </div>
        <div class="relative -mx-4 -mb-4 bg-red-200 flex-grow overflow-hidden">
            <div class="flex absolute m-4 top-0 gap-1 left-0 desktop:left-auto desktop:right-0">
                <DiscreetButton
                    icon="github"
                    action="report to Github"
                    class="bg-red-200 text-red-800"
                    :url="githubReportUrl"
                />
                <DiscreetButton
                    v-if="$app.isErrorReportingAvailable"
                    icon="bug"
                    :action="sentryId ? 'view Sentry ID' : 'report to Sentry'"
                    class="bg-red-200 text-red-800"
                    @click="report"
                />
                <DiscreetButton
                    icon="terminal"
                    action="inspect in console"
                    class="bg-red-200 text-red-800"
                    @click="inspect"
                />
                <DiscreetButton
                    icon="copy"
                    action="copy to clipboard"
                    class="bg-red-200 text-red-800"
                    @click="copy"
                />
            </div>
            <pre
                class="px-4 pb-4 mt-16 text-xs text-red-900 h-full overflow-auto desktop:mt-0 desktop:pt-4"
                v-text="stackTrace"
            />
        </div>
    </AppModal>
</template>

<script lang="ts">
import Errors from '@/utils/Errors';

import DiscreetButton from '@/components/DiscreetButton.vue';
import MarkdownContent from '@/components/MarkdownContent.vue';
import Modal from '@/components/mixins/Modal';

interface Data {
    sentryId?: string;
}

export default Modal.extend({
    components: {
        DiscreetButton,
        MarkdownContent,
    },
    props: {
        error: {
            type: Error,
            required: true,
        },
    },
    data(): Data {
        return { sentryId: this.error.sentryId };
    },
    computed: {
        title(): string {
            const name = this.error.name || 'Error';
            const message = this.error.message || 'Unknown';

            return `${name}: ${message}`;
        },
        stackTrace(): string {
            // TODO without sourcemaps this may not be so useful...
            const stack = this.error.stack || 'Stacktrace not found\n';

            return stack + '\n';
        },
        githubReportUrl(): string {
            const title = encodeURIComponent(this.title);
            const body = encodeURIComponent(
                '[Please explain what you were trying to do when this error appeared.]\n\n' +
                'Stack trace:\n' +
                '```' + this.stackTrace + '```',
            );

            return `${this.$app.sourceUrl}/issues/new?title=${title}&body=${body}`;
        },
    },
    methods: {
        report() {
            if (this.sentryId) {
                this.$ui.showSnackbar('Sentry ID: ' + this.sentryId, { transient: true });

                return;
            }

            Errors.report(this.error);

            this.sentryId = this.error.sentryId;
            this.$ui.showSnackbar('Error reported to Sentry: ' + this.sentryId, { transient: true });
        },
        inspect() {
            (window as any).error = this.error;

            this.$ui.showSnackbar('You can now use the **error** variable in the console', { transient: true });
        },
        copy() {
            const textarea = document.createElement('textarea');
            textarea.value = `${this.title}\n\n${this.stackTrace}`;
            textarea.style.position = 'fixed';
            textarea.style.top = '-9999px';
            document.body.appendChild(textarea);
            textarea.focus();
            textarea.select();
            document.execCommand('copy');
            textarea.remove();

            this.$ui.showSnackbar('Stack trace copied to clipboard', { transient: true });
        },
    },
});
</script>
