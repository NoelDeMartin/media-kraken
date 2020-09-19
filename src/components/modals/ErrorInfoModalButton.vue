<template>
    <component
        :is="isLink ? 'a' : 'button'"
        v-bind="
            isLink
                ? { target: '_blank', href: url }
                : { type: 'button' }
        "
        class="relative flex items-center rounded px-2 group h-10 text-sm overflow-hidden desktop:h-8"
        :title="action"
        @click="$emit('click')"
    >
        <div class="absolute bg-black-overlay inset-0" />
        <BaseIcon :name="icon" class="w-4 h-4" />
        <div
            class="
                text-left w-40 truncate duration-300 transition-all
                group-hover:w-40 desktop:w-0
            "
        >
            <span class="ml-2">{{ actionText }}</span>
        </div>
    </component>
</template>

<script lang="ts">
import Str from '@/utils/Str';
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
    computed: {
        isLink(): boolean {
            return !!this.url;
        },
        actionText(): string {
            return this.$ui.desktop ? this.action : Str.capitalize(this.action);
        },
    },
});
</script>
