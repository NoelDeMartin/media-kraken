<template>
    <Modal wrapper-class="sm:max-w-md" class="p-6">
        <div class="flex flex-col items-center justify-center">
            <div class="flex items-center gap-2 font-medium text-slate-800">
                <i-mdi-loading class="size-5 animate-spin text-blue-600" />
                <span>{{ $t('movies.importModals.importing') }}</span>
            </div>
            <div class="relative mt-4 h-4 w-full overflow-hidden rounded bg-slate-200">
                <div
                    class="absolute inset-y-0 left-0 bg-blue-600 transition-all duration-200"
                    :style="{ width: `${total ? (100 * current) / total : 0}%` }"
                />
            </div>
            <span class="mt-2 text-xs font-semibold tracking-wider text-slate-600"> {{ current }} / {{ total }} </span>
            <Button variant="outline" class="mt-4" @click="$emit('cancel')">
                {{ $t('movies.importModals.stop') }}
            </Button>
        </div>
    </Modal>
</template>

<script setup lang="ts">
defineProps<{
    current: number;
    total: number;
}>();

defineEmits<{
    (e: 'cancel'): void;
}>();
</script>
