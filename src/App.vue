<template>
    <div class="font-montserrat font-normal text-base text-gray-900 leading-tight">
        <router-view />
        <BaseTransition animation="fade">
            <div v-show="$ui.showOverlay" class="fixed inset-0 z-20">
                <div class="absolute inset-0 bg-black opacity-50" />
            </div>
        </BaseTransition>
        <BaseTransition animations="fade scale">
            <div
                v-if="$ui.modals.length > 0"
                class="fixed inset-0 p-4 z-30 flex items-center justify-center"
                @click.self="$ui.closeModal($ui.modals[$ui.modals.length - 1].id)"
            >
                <component
                    :is="modal.component"
                    v-for="modal of $ui.modals"
                    :key="modal.id"
                    v-bind="modal.props"
                />
            </div>
        </BaseTransition>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({});
</script>

<style lang="scss">
    @import "./styles/main.scss";
</style>
