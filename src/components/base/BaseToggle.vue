<template>
    <div
        class="inline-flex items-center cursor-pointer"
        :aria-checked="checked ? 'true' : 'false'"
        role="checkbox"
        tabindex="0"
        @click="toggle"
    >
        <span
            class="text-sm mr-1 w-16"
            :class="{
                'text-gray-700 font-medium': checked,
                'text-gray-500': !checked,
            }"
            v-text="checked ? 'Enabled' : 'Disabled'"
        />
        <span class="relative w-12 h-6">
            <span
                aria-hidden="true"
                class="
                    absolute rounded-full w-10 h-4 mt-1 ml-1 top-0 left-0
                    border border-primary-300 text-primary-900
                    transition-colors duration-200
                "
                :class="{
                    'bg-primary-300': checked,
                }"
            />
            <span
                aria-hidden="true"
                class="
                    absolute rounded-full w-6 h-6 left-0 top-1/2 -translate-y-1/2
                    bg-primary-800 transform transition-transform duration-200
                "
                :class="{
                    'translate-x-6': checked,
                    'translate-x-0': !checked,
                }"
            />
        </span>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    model: {
        prop: 'checked',
        event: 'change',
    },
    props: {
        checked: {
            type: Boolean,
            default: false,
        },
    },
    methods: {
        toggle() {
            this.$emit('change', !this.checked);
        },
    },
});
</script>
