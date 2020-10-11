<template>
    <AppModal :id="id" :options="options" title="Settings">
        <div
            class="mb-2 -mx-4 px-4 pt-4 border-t max-w-readable"
            :class="{ 'border-b pb-4': $app.isErrorReportingAvailable }"
        >
            <div class="flex justify-between">
                <h3 class="text-lg font-medium">
                    Animations
                </h3>
                <BaseToggle v-model="animations" />
            </div>
            <p class="text-sm text-gray-700 mt-2 leading-relaxed">
                Animations are cool, but it's also cool to have a long battery life. If you want to save
                battery or your device is struggling to keep up, turn off the animations for a simpler experience.
            </p>
        </div>
        <div v-if="$app.isErrorReportingAvailable" class="mb-2 -mx-4 px-4 pt-4 max-w-readable">
            <div class="flex justify-between">
                <h3 class="text-lg font-medium">
                    Error Reporting
                </h3>
                <BaseToggle v-model="errorReporting" />
            </div>
            <p class="text-sm text-gray-700 mt-2 leading-relaxed">
                If you are experiencing errors, you can turn on error reporting to send them to <BaseLink url="https://sentry.io">
                    Sentry
                </BaseLink>. Make sure that trackers are not blocking the reports. If things are so bad that
                you can't even get to this modal, you can always force error reporting appending
                <code>?error_reporting=on</code> in the address bar.
            </p>
        </div>
    </AppModal>
</template>

<script lang="ts">
import Services from '@/services';

import Errors from '@/utils/Errors';

import Modal from '@/components/mixins/Modal';

export default Modal.extend({
    data: () => ({
        animations: Services.$ui.animationsEnabled,
        errorReporting: Services.$app.isErrorReportingEnabled,
    }),
    watch: {
        animations(enabled: boolean) { this.$ui.setAnimationsEnabled(enabled); },
        errorReporting(enabled: boolean) { Errors.setReportingEnabled(enabled); },
    },
});
</script>
