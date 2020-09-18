<template>
    <router-link
        v-if="route"
        class="inline-block text-primary-700 hover:underline hover:text-primary-900"
        :title="title"
        :to="routerTo"
    >
        <slot />
    </router-link>
    <a
        v-else-if="url"
        class="inline-block text-primary-700 hover:underline hover:text-primary-900"
        target="_blank"
        :title="title"
        :href="url"
    >
        <slot />
    </a>
    <button
        v-else
        type="button"
        class="inline-block text-primary-700 hover:underline hover:text-primary-900"
        @click="$emit('click', $event)"
    >
        <slot />
    </button>
</template>

<script lang="ts">
import { Location } from 'vue-router';
import Vue from 'vue';

export default Vue.extend({
    props: {
        title: {
            type: String,
            default: null,
        },
        url: {
            type: String,
            default: null,
        },
        route: {
            type: String,
            default: null,
        },
    },
    computed: {
        routerTo(): Location {
            return { name: this.route };
        },
    },
});
</script>
