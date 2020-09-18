<template>
    <li class="flex flex-col mb-4">
        <div class="flex items-center">
            <BaseIcon :name="icon" class="w-4 h-4 mr-2" :class="iconClass" />
            <span class="mr-2 text-gray-700"><slot /></span>
        </div>
        <BaseLink class="ml-6 text-sm self-start" @click="$emit('inspect')">
            view details
        </BaseLink>
    </li>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    props: {
        icon: {
            type: String,
            required: true,
        },
        iconClass: {
            type: String,
            required: true,
        },
    },
});
</script>
