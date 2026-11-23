<template>
    <footer
        v-if="owner || (loaded && fallback)"
        class="mt-8 flex items-center gap-2 border-t border-gray-200 pt-4 text-sm text-gray-500"
    >
        <template v-if="owner">
            <a :href="owner.webId" target="_blank" rel="noopener" tabindex="-1" aria-hidden="true" class="shrink-0">
                <SolidAvatar :user="owner" class="size-8" />
            </a>
            <i18n-t keypath="lists.createdBy" tag="span" scope="global">
                <template #name>
                    <a :href="owner.webId" target="_blank" rel="noopener" class="hover:underline">
                        {{ userDisplayName(owner) }}
                    </a>
                </template>
            </i18n-t>
        </template>
        <template v-else>
            <i-ph-users-three class="size-4 shrink-0" />
            {{ $t('lists.createdBySomeoneElse') }}
        </template>
    </footer>
</template>

<script setup lang="ts">
import { userDisplayName } from '@aerogel/plugin-solid';
import type { SolidUserProfile } from '@noeldemartin/solid-utils';
import { ref, watch } from 'vue';

import { fetchListOwner } from '@lists/lib/sharing';
import type List from '@lists/models/List';

const { list } = defineProps<{ list: List; fallback?: boolean }>();
const owner = ref<SolidUserProfile | null>(null);
const loaded = ref(false);

watch(
    [() => list.owner, () => list.url],
    async (_, __, onCleanup) => {
        let cancelled = false;

        onCleanup(() => (cancelled = true));

        loaded.value = false;
        owner.value = null;

        const listOwner = await fetchListOwner(list);

        if (cancelled) {
            return;
        }

        owner.value = listOwner;
        loaded.value = true;
    },
    { immediate: true },
);
</script>
