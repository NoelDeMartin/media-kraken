<template>
    <button
        :type="submit ? 'submit' : 'button'"
        class="flex items-center px-4 py-2 rounded-md"
        @click="$emit('click', $event)"
    >
        <BaseIcon
            v-if="icon"
            :name="icon"
            :class="iconClass"
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
            default: 'w-6 h-6 mr-2',
        },
    },
});
</script>
