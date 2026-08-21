<template>
    <div class="flex items-center gap-1">
        <i-bi-collection class="size-4" />
        <NavMenu :label="$t('app.nav.collection')" :sections />
    </div>
</template>

<script setup lang="ts">
import { translate } from '@aerogel/core';

const sections = [
    { label: translate('app.nav.movies'), route: 'movies.index' },
    { label: translate('app.nav.shows'), route: 'shows.index' },
];
</script>
