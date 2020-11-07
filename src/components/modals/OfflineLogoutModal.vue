<template>
    <!-- TODO migrate this to confirm modal -->
    <AppModal :id="id" :options="options" title="Are you sure you want to log out?">
        <p class="text-gray-700 text-sm leading-relaxed">
            You are <BaseLink @click="$ui.openFileMarkdownModal('application-storage')">
                using browser storage
            </BaseLink> and <strong>your data will be deleted</strong> when you log out. If you want to make sure that
            it isn't lost, you can <BaseLink @click="$media.exportCollection()">
                export your collection
            </BaseLink> and you'll be able to import it later (using JSON-LD import).
        </p>

        <div class="flex justify-end mt-4">
            <BaseButton
                class="text-primary-700 border border-primary-500 mr-2 hover:bg-black-overlay"
                @click="close"
            >
                Cancel
            </BaseButton>
            <BaseButton
                class="text-white bg-red-500 hover:bg-red-700"
                @click="$auth.logout(true) && close()"
            >
                Log out
            </BaseButton>
        </div>
    </AppModal>
</template>

<script lang="ts">
import Modal from '@/components/mixins/Modal';

export default Modal.extend({});
</script>
