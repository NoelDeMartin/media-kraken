<template>
    <a
        :href="person.tmdbUrl ?? undefined"
        target="_blank"
        rel="noopener"
        class="group focus-visible:ring-primary-500 flex w-24 flex-col items-center gap-2 rounded-lg text-center focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
    >
        <div
            class="rounded-card relative aspect-2/3 w-full overflow-hidden border border-slate-200 bg-gray-200 shadow-sm"
        >
            <img
                v-if="person.imageUrl && !loadFailed"
                :src="person.imageUrl"
                alt=""
                class="size-full object-cover"
                loading="lazy"
                decoding="async"
                @error="loadFailed = true"
            />
            <i-mdi-account
                v-else
                class="absolute top-1/2 left-1/2 size-12 -translate-x-1/2 -translate-y-1/3 text-gray-400"
                aria-hidden="true"
            />
            <div
                class="absolute inset-0 bg-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            />
        </div>
        <span class="text-sm leading-tight font-medium text-gray-900">
            {{ person.name }}
        </span>
    </a>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

import type Person from '@/models/Person';

const { person } = defineProps<{ person: Person }>();
const loadFailed = ref(false);

watch(
    () => person.imageUrl,
    () => (loadFailed.value = false),
);
</script>
