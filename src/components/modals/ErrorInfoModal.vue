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
                {{ errorName }}
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
        <div class="flex flex-col relative -mx-4 -mb-4 bg-red-200 flex-grow overflow-hidden">
            <div class="flex flex-col relative p-4 desktop:flex-row">
                <p class="text-gray-700 leading-relaxed mb-3 desktop:mr-3 desktop:mb-0">
                    {{ errorMessage }}
                </p>
                <div v-if="$ui.desktop" class="flex-shrink-0 w-40" />
                <div
                    class="
                        flex flex-col
                        desktop:absolute desktop:right-0 desktop:top-0 desktop:m-4
                        desktop:flex-row-reverse
                    "
                >
                    <ErrorInfoModalButton
                        icon="terminal"
                        action="inspect in console"
                        class="bg-red-200 text-red-800 mb-2 desktop:mb-0"
                        @click="inspect"
                    />
                    <ErrorInfoModalButton
                        icon="copy"
                        action="copy to clipboard"
                        class="bg-red-200 text-red-800 mb-2 desktop:mr-2 desktop:mb-0"
                        @click="copy"
                    />
                    <ErrorInfoModalButton
                        v-if="$app.isErrorReportingAvailable"
                        icon="bug"
                        :action="sentryId ? 'View report ID' : 'Send error report'"
                        class="bg-red-200 text-red-800 mb-2 desktop:mr-2 desktop:mb-0"
                        @click="report"
                    />
                    <ErrorInfoModalButton
                        icon="github"
                        action="report in GitHub"
                        class="bg-red-200 text-red-800 desktop:mr-2"
                        :url="githubReportUrl"
                    />
                </div>
            </div>
            <pre
                class="p-4 h-full text-xs text-red-900 bg-white-overlay overflow-auto"
                v-text="stackTrace"
            />
        </div>
    </AppModal>
</template>

<script lang="ts">
import Errors from '@/utils/Errors';

import ErrorInfoModalButton from '@/components/modals/ErrorInfoModalButton.vue';
import MarkdownContent from '@/components/MarkdownContent.vue';
import Modal from '@/components/mixins/Modal';

interface Data {
    sentryId?: string;
}

export default Modal.extend({
    components: {
        ErrorInfoModalButton,
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
        errorName(): string {
            return this.error.name || 'Error';
        },
        errorMessage(): string {
            return this.error.message || 'Unknown error';
        },
        stackTrace(): string {
            // TODO without sourcemaps this may not be so useful...
            const stack = this.error.stack || 'Stacktrace not found';

            return stack + '\n';
        },
        githubReportUrl(): string {
            const title = encodeURIComponent(`${this.errorName}: ${this.errorMessage}`);
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
                this.$ui.showSnackbar('Sentry.io ID: ' + this.sentryId, { transient: true });

                return;
            }

            Errors.report(this.error);

            this.sentryId = this.error.sentryId;
            this.$ui.showSnackbar('Error reported to Sentry.io: ' + this.sentryId, { transient: true });
        },
        inspect() {
            (window as any).error = this.error;

            this.$ui.showSnackbar('You can now use the **error** variable in the console', { transient: true });
        },
        copy() {
            const textarea = document.createElement('textarea');
            textarea.value = `${this.errorName}: ${this.errorMessage}\n\n${this.stackTrace}`;
            textarea.style.position = 'fixed';
            textarea.style.top = '-9999px';
            document.body.appendChild(textarea);
            textarea.focus();
            textarea.select();
            document.execCommand('copy');
            textarea.remove();

            this.$ui.showSnackbar('Debug information copied to clipboard', { transient: true });
        },
    },
});
</script>
