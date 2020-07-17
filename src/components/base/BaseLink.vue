<template>
    <button
        v-if="button"
        type="button"
        class="inline-block text-primary-700 hover:underline hover:text-primary-900"
        @click="$emit('click', $event)"
    >
        <slot />
    </button>
    <router-link
        v-else-if="route"
        class="inline-block text-primary-700 hover:underline hover:text-primary-900"
        :title="title"
        :to="routerTo"
    >
        <slot />
    </router-link>
    <a
        v-else
        class="inline-block text-primary-700 hover:underline hover:text-primary-900"
        target="_blank"
        :title="title"
        :href="url"
    >
        <slot />
    </a>
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
        button: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        routerTo(): Location {
            return { name: this.route };
        },
    },
});
</script>
