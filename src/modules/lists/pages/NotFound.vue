<template>
    <Page v-if="$route.query.sharing === 'true'" class="items-center justify-center">
        <h1 class="text-2xl font-bold">
            {{ $t('lists.notFound') }}
        </h1>

        <Link route="home">
            {{ $t('lists.goHome') }}
        </Link>
    </Page>
    <NotFound v-else />
</template>

<script setup lang="ts">
import { Link } from '@aerogel/core';
import { NotFound } from '@aerogel/plugin-routing';
</script>
