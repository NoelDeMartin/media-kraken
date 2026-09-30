<template>
    <div class="flex w-full flex-col items-center gap-2 text-center">
        <MaybeLink
            :href="person.tmdbUrl"
            target="_blank"
            rel="noopener"
            tabindex="-1"
            class="group block w-full"
            aria-hidden="true"
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
                    class="absolute inset-0 bg-black/20 opacity-0 transition-opacity duration-300"
                    :class="person.tmdbUrl ? 'group-hover:opacity-100' : ''"
                />
            </div>
        </MaybeLink>
        <MaybeLink
            :href="person.tmdbUrl"
            target="_blank"
            rel="noopener"
            class="text-sm leading-tight font-medium text-gray-900"
            :class="person.tmdbUrl ? 'hover:underline' : ''"
        >
            {{ person.name }}
        </MaybeLink>
        <p v-if="characters?.length" class="-mt-1 text-xs leading-tight text-gray-600">
            {{ characters.join(' / ') }}
        </p>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

import type Person from '@/models/Person';

const { person } = defineProps<{ person: Person; characters?: string[] }>();
const loadFailed = ref(false);

watch(
    () => person.imageUrl,
    () => (loadFailed.value = false),
);
</script>
