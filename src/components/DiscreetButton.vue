<template>
    <a
        v-if="url"
        class="relative flex items-center rounded px-2 group h-8 text-sm overflow-hidden"
        target="_blank"
        :title="action"
        :href="url"
    >
        <div class="absolute bg-black-overlay inset-0" />
        <BaseIcon :name="icon" class="w-4 h-4" />
        <span class="ml-1 w-0 truncate duration-300 transition-all group-hover:w-32">
            {{ action }}
        </span>
    </a>
    <button
        v-else
        type="button"
        class="relative flex items-center rounded px-2 group h-8 text-sm overflow-hidden"
        :title="action"
        @click="$emit('click')"
    >
        <div class="absolute bg-black-overlay inset-0" />
        <BaseIcon :name="icon" class="w-4 h-4" />
        <span class="ml-1 w-0 truncate duration-300 transition-all group-hover:w-32">
            {{ action }}
        </span>
    </button>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    props: {
        icon: {
            type: String,
            required: true,
        },
        action: {
            type: String,
            required: true,
        },
        url: {
            type: String,
            default: null,
        },
    },
});
</script>
