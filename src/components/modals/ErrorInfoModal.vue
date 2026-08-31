<template>
    <Modal wrapper-class="sm:max-w-xl" class="p-6">
        <HeadlessModalTitle class="text-lg font-semibold text-red-600">
            {{ $t('movies.importModals.errorDetails') }}
        </HeadlessModalTitle>
        <p class="mt-2 text-sm text-gray-700">
            {{ error.message }}
        </p>
        <pre v-if="error.stack" class="mt-4 max-h-60 overflow-auto rounded bg-slate-100 p-3 text-xs text-slate-800">{{
            error.stack
        }}</pre>
        <div class="mt-6 flex justify-end">
            <Button @click="close">
                {{ $t('movies.importModals.close') }}
            </Button>
        </div>
    </Modal>
</template>

<script setup lang="ts">
import { useModal } from '@aerogel/core';

defineProps<{ error: Error }>();
const { close } = useModal();
</script>
