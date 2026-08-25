<template>
    <nav class="flex items-center gap-3" :aria-label="$t('app.nav.label')">
        <Link
            route="discover"
            class="text-primary-text flex items-center gap-1"
            :class="{ 'font-bold': $route.name === 'discover' }"
        >
            <i-ph-compass class="size-5" />
            <span>{{ $t('app.nav.discover') }}</span>
        </Link>

        <div class="flex items-center gap-1">
            <i-bi-collection class="size-4" />
            <NavMenu :label="$t('app.nav.collection')" :sections />
        </div>
    </nav>
</template>

<script setup lang="ts">
import { translate } from '@aerogel/core';

const sections = [
    { label: translate('app.nav.movies'), route: 'movies.index' },
    { label: translate('app.nav.shows'), route: 'shows.index' },
    { label: translate('app.nav.lists'), route: 'lists.index' },
];
</script>
