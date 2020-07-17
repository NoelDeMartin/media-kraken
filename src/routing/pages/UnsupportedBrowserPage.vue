<template>
    <div class="flex flex-grow flex-col items-center justify-center w-full h-full">
        <BaseIcon name="media-kraken-confused" class="w-48 h-48 mb-4" />
        <h2 class="text-2xl font-semibold mb-4">
            Unsupported Browser
        </h2>
        <p class="text-gray-800 text-center leading-relaxed mb-1">
            Unfortunately, this browser doesn't support IndexedDB which is necessary for Media Kraken to run.
        </p>
        <p v-if="isFirefox" class="text-gray-800 text-center leading-relaxed mb-2">
            Are you using Firefox in private browsing mode? This is a <BaseLink url="https://bugzilla.mozilla.org/show_bug.cgi?id=1639542">
                known bug
            </BaseLink>.
        </p>
        <BaseLink url="https://caniuse.com/#feat=indexeddb">
            Find a compatible browser
        </BaseLink>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    data: () => ({
        isFirefox: navigator && navigator.userAgent && /firefox/i.test(navigator.userAgent),
    }),
});
</script>
