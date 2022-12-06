<template>
    <footer class="px-4 py-2 text-xs text-primary-700 text-center">
        <div
            class="flex max-w-content mx-auto"
            :class="$viewer.isActive || !$auth.loggedIn ? 'justify-center' : 'justify-end'"
        >
            <button
                type="button"
                class="mr-1 hover:underline hover:text-primary-900"
                @click="$ui.openFileMarkdownModal('about')"
            >
                about
            </button>
            | <BaseLink
                title="View application source code"
                :url="$app.sourceUrl"
                class="mx-1"
            >
                source
            </BaseLink>
            | <BaseLink
                title="View application source code"
                :url="$app.releaseNotesUrl"
                class="mx-1"
            >
                {{ $app.versionName }}
            </BaseLink>
        </div>
    </footer>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({});
</script>
