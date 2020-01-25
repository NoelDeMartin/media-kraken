<template>
    <component :is="iconComponent" class="w-3 h-3 fill-current" />
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    props: {
        name: {
            type: String,
            required: true,
        },
    },
    computed: {
        iconComponent() {
            return require(`@/icons/${this.name}.svg`).default;
        },
    },
});
</script>
