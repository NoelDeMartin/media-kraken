<template>
    <img v-if="costumeImageUrl" :src="costumeImageUrl" alt="">
    <component :is="iconComponent" v-else class="fill-current" />
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
        costumeImageUrl(): string | null {
            if (this.name !== 'media-kraken') {
                return null;
            }

            return this.$app.costumeImageUrl;
        },
    },
});
</script>
