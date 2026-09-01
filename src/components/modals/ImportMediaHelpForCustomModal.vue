<template>
    <Modal :title="$t('import.custom.title')" wrapper-class="sm:max-w-2xl">
        <Markdown :text="$t('import.custom.description')" />
        <Details :label="$t('import.custom.formatDetails')" content-class="p-0" class="mt-2">
            <table class="mt-4 w-full border-collapse overflow-hidden rounded-lg border border-slate-200 text-sm">
                <thead class="bg-slate-50">
                    <tr>
                        <th class="border-r border-slate-200 px-4 py-2.5 text-left font-semibold text-slate-700">
                            {{ $t('import.custom.csv.column') }}
                        </th>
                        <th class="border-r border-slate-200 px-4 py-2.5 text-left font-semibold text-slate-700">
                            {{ $t('import.custom.csv.format') }}
                        </th>
                        <th class="px-4 py-2.5 text-left font-semibold text-slate-700">
                            {{ $t('import.custom.csv.description') }}
                        </th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                    <tr v-for="column in columns" :key="column">
                        <td class="border-r border-slate-200 px-4 py-2.5 font-medium whitespace-nowrap text-slate-700">
                            {{ $t(`import.custom.csv.${column}`) }}
                        </td>
                        <td class="border-r border-slate-200 px-4 py-2.5 font-medium whitespace-nowrap text-slate-700">
                            {{ $t(`import.custom.csv.${column}Format`) }}
                        </td>
                        <td class="px-4 py-2.5 text-slate-600">
                            <Markdown :text="$t(`import.custom.csv.${column}Description`)" inline />
                        </td>
                    </tr>
                </tbody>
            </table>
        </Details>
        <Markdown :text="$t('import.custom.aiInstructions')" class="mt-4" />
        <Button variant="secondary" class="mt-4" @click="copyAIInstructions()">
            <i-ph-copy-bold class="size-4" />
            <span>{{ $t('import.custom.aiInstructionsCopy') }}</span>
        </Button>
    </Modal>
</template>

<script setup lang="ts">
import { translate, UI } from '@aerogel/core';

const columns = ['name', 'imdb', 'date'];

async function copyAIInstructions() {
    await navigator.clipboard.writeText(translate('import.custom.aiInstructionsContent'));

    UI.toast(translate('import.custom.aiInstructionsCopied'));
}
</script>
