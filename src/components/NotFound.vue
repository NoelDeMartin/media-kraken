<template>
    <div class="flex flex-grow flex-col items-center justify-center w-full h-full">
        <BaseIcon name="media-kraken-confused" class="w-48 h-48 mb-4" />
        <h2 class="text-2xl font-semibold">
            404: Not Found
        </h2>
        <BaseLink class="mt-2" route="home">
            go home
        </BaseLink>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    mounted() {
        this.$ui.hideHeader();
    },
    destroyed() {
        this.$ui.showHeader();
    },
});
</script>
