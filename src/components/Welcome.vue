<template>
    <div class="mx-auto flex max-w-prose flex-col gap-8">
        <h1 class="text-2xl font-bold">{{ $t('welcome.title') }}</h1>
        <Markdown lang-key="welcome.message" />
        <div class="flex flex-col gap-4">
            <Button variant="outline" class="w-full" @click="$ui.modal(ImportMediaModal)">
                {{ $t('welcome.import') }}
            </Button>
            <Button variant="outline" route="discover" class="w-full">
                {{ $t('welcome.discover') }}
            </Button>
            <Button variant="outline" class="w-full">
                {{ $t('welcome.getStarted') }}
            </Button>
        </div>
    </div>
</template>

<script setup lang="ts">
import ImportMediaModal from '@/components/modals/ImportMediaModal.vue';
</script>
