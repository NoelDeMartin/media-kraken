<template>
    <footer class="bg-kraken-lightest w-full">
        <div class="max-w-content mx-auto px-4 py-2 text-xs text-kraken-darkest text-center">
            <a
                class="inline-block hover:underline"
                href="https://github.com/noeldemartin/media-kraken"
                target="_blank"
            >
                Media Kraken
            </a> | Version {{ $config.version }}
        </div>
    </footer>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({});
</script>
