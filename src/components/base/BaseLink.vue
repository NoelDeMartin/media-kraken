<template>
    <a
        :title="title"
        :href="href"
        :target="blank ? '_blank' : null"
        class="inline-block text-kraken-darker hover:underline hover:text-kraken-darkest"
    >
        <slot />
    </a>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    props: {
        title: {
            type: String,
            default: null,
        },
        href: {
            type: String,
            required: true,
        },
        blank: {
            type: Boolean,
            default: false,
        },
    },
});
</script>
