<template>
    <footer class="px-4 py-2 text-xs text-kraken-darker text-center">
        <div class="flex justify-end">
            <BaseLink
                :blank="true"
                title="View application source code"
                href="https://github.com/noeldemartin/media-kraken"
                class="mr-1"
            >
                view source
            </BaseLink>
            | v{{ $config.version }}
        </div>
    </footer>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({});
</script>
