<template>
    <component :is="iconComponent" class="fill-current" />
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
        iconComponent(): Vue {
            return require(`@/assets/icons/${this.name}.svg`).default;
        },
    },
});
</script>
