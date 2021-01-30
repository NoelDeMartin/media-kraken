<template>
    <BaseTransitionGroup animations="fade scale">
        <aside
            v-for="(modal, index) of $ui.modals"
            :key="modal.id"
            class="
                fixed inset-0 p-4 z-50 flex items-center justify-center
                transition-all transform ease-in duration-300
            "
            :class="{ 'opacity-0 scale-90': index < $ui.modals.length - 1 }"
            @click.self="$ui.closeModal(modal.id)"
        >
            <component :is="modal.component" v-bind="modal.props" />
        </aside>
    </BaseTransitionGroup>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({});
</script>
