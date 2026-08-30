<template>
    <a :href="url" target="_blank" rel="noopener" :title="$t('app.openIn', { domain: domain || url })">
        <component :is="icon.component" :class="icon.class" />
        <span class="sr-only">
            {{ domain || url }}
        </span>
    </a>
</template>

<script setup lang="ts">
import { urlParse } from '@noeldemartin/utils';
import { computed } from 'vue';
import IconImdb from '~icons/app/imdb';
import IconTmdb from '~icons/app/tmdb';
import IconExternalLink from '~icons/mdi/open-in-new';

const ICONS = {
    'themoviedb.org': {
        component: IconTmdb,
        class: 'size-10',
    },
    'imdb.com': {
        component: IconImdb,
        class: 'size-10',
    },
    default: {
        component: IconExternalLink,
        class: 'size-6',
    },
};

const { url } = defineProps<{ url: string }>();
const domain = computed(() => urlParse(url)?.domain?.replace(/^www\./, ''));
const icon = computed(() => ICONS[domain.value as keyof typeof ICONS] ?? ICONS.default);
</script>
