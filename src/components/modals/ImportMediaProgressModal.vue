<template>
    <Modal
        :title="$t('import.importing')"
        class="flex flex-col items-center justify-center p-6"
        persistent
        title-hidden
    >
        <div class="mt-8 flex items-center gap-2 font-medium text-slate-800" aria-hidden="true">
            <i-mdi-loading class="text-primary-600 size-5 animate-spin" />
            <span>{{ $t('import.importing') }}</span>
        </div>
        <ProgressBar :progress class="mt-2" />
        <Button variant="outline" class="mt-4" @click="cancelled = true">
            {{ $t('import.stop') }}
        </Button>
    </Modal>
</template>

<script setup lang="ts">
import { UI } from '@aerogel/core';
import { onMounted, ref } from 'vue';

import ImportMediaResultModal from '@/components/modals/ImportMediaResultModal.vue';
import { ImportMedia } from '@/jobs/ImportMedia';
import type { ExternalMedia } from '@/lib/parsers/MediaParser';

const { data } = defineProps<{ data: ExternalMedia[] }>();
const progress = ref(0);
const cancelled = ref(false);

onMounted(async () => {
    const log = await ImportMedia.run(
        data,
        ({ current, total }) => (progress.value = current / total),
        () => cancelled.value,
    );

    UI.closeAllModals();
    UI.modal(ImportMediaResultModal, { log });
});
</script>
