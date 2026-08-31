<template>
    <Modal wrapper-class="sm:max-w-xl" class="p-6">
        <Markdown :text="content" />
        <div class="mt-6 flex justify-end">
            <Button @click="close">
                {{ $t('movies.importModals.close') }}
            </Button>
        </div>
    </Modal>
</template>

<script setup lang="ts">
import { useModal } from '@aerogel/core';

defineProps<{ content: string }>();
const { close } = useModal();
</script>
