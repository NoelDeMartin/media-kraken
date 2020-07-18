<template>
    <button
        :type="submit ? 'submit' : 'button'"
        class="flex items-center px-4 py-2 rounded-md"
        @click="$emit('click', $event)"
    >
        <BaseIcon
            v-if="icon"
            :name="icon"
            :class="buttonIconClass"
        />
        <span :class="textClass">
            <slot />
        </span>
    </button>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    props: {
        submit: {
            type: Boolean,
            default: false,
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
    },
    computed: {
        buttonIconClass(): string {
            return this.iconClass || ('w-6 h-6' + (this.$slots.default ? ' mr-2' : ''));
        },
    },
});
</script>
