<template>
    <span
        v-if="visibility"
        class="absolute top-2 right-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium shadow-sm backdrop-blur-sm"
        :class="{
            'bg-lime-50/90 text-lime-800': visibility === 'public',
            'bg-sky-50/90 text-sky-800': visibility === 'unlisted',
            'bg-stone-900/80 text-white': visibility === 'private',
        }"
    >
        <component :is="LIST_VISIBILITY_ICONS[visibility]" class="size-3.5 shrink-0" aria-hidden="true" />
        {{ $t(`lists.share.${visibility}`) }}
    </span>
</template>

<script setup lang="ts">
import { useCache } from '@aerogel/core';
import { DAY_MILLISECONDS, silenced } from '@noeldemartin/utils';
import type { ModelWithUrl } from 'soukai-bis';
import { watch } from 'vue';

import { LIST_VISIBILITY_ICONS } from '@lists/lib/icons';
import { canShareList, fetchListVisibility, listVisibilityCacheKey } from '@lists/lib/sharing';
import type { ListVisibility } from '@lists/lib/sharing';
import type List from '@lists/models/List';

const { list } = defineProps<{ list: ModelWithUrl<List> }>();
const { value: visibility, stale } = useCache<ListVisibility>(listVisibilityCacheKey(list), {
    maxAge: DAY_MILLISECONDS,
});

watch(
    [stale, () => canShareList(list)],
    async ([isStale, isShareable]) => {
        if (!isStale || !isShareable) {
            return;
        }

        await silenced(fetchListVisibility(list));
    },
    { immediate: true },
);
</script>
