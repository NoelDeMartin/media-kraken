<template>
    <AppModal v-if="$media.importOperation" :id="id" :options="options">
        <div class="flex flex-col items-center justify-center">
            <div class="flex justify-center items-center">
                <LoadingCircle class="w-6 h-6 text-primary-700 mr-2" />
                <span>Importing movies...</span>
            </div>
            <div class="flex items-center justify-start relative mt-4 bg-primary-200 h-5 w-64 rounded overflow-hidden">
                <div
                    class="absolute left-0 inset-y-0 bg-primary-500"
                    :style="{ width: `${100 * $media.importOperation.current / $media.importOperation.total}%` }"
                />
                <span
                    class="relative ml-2 z-10 tracking-widest
                    font-semibold text-white text-xs"
                > {{ $media.importOperation.current }}/{{ $media.importOperation.total }}</span>
            </div>
            <BaseButton
                class="border border-primary-500 mt-4 text-sm text-primary-700 justify-center hover:bg-black-overlay"
                @click="$media.cancelImport()"
            >
                Stop
            </BaseButton>
        </div>
    </AppModal>
</template>

<script lang="ts">
import LoadingCircle from '@/components/LoadingCircle.vue';
import Modal from '@/components/mixins/Modal';

export default Modal.extend({
    components: {
        LoadingCircle,
    },
});
</script>
