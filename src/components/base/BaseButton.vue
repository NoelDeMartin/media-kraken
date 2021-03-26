<template>
    <component
        :is="href ? 'a' : 'button'"
        v-bind="
            href
                ? {
                    href: href,
                    target: '_blank',
                }
                : { type: submit ? 'submit' : 'button' }
        "
        class="flex items-center rounded-md"
        :class="{ 'px-4 py-2': !noPadding }"
        @click="!href && $emit('click', $event)"
    >
        <BaseIcon
            v-if="icon"
            :name="icon"
            :class="computedIconClass"
        />
        <span :class="textClass">
            <slot />
        </span>
    </component>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    props: {
        submit: {
            type: Boolean,
            default: false,
        },
        href: {
            type: String,
            default: null,
        },
        icon: {
            type: String,
            default: null,
        },
        textClass: {
            type: String,
            default: '',
        },
        iconClass: {
            type: String,
            default: null,
        },
        noPadding: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        computedIconClass(): string {
            return this.iconClass || ('w-6 h-6' + (this.$slots.default ? ' mr-2' : ''));
        },
    },
});
</script>
