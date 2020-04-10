<template>
    <AppModal
        :id="id"
        :options="options"
        class="w-full"
        title="Import media"
    >
        <MediaImporter @imported="close" />
    </AppModal>
</template>

<script lang="ts">
import Modal from '@/components/mixins/Modal';

import MediaImporter from '@/components/MediaImporter.vue';

export default Modal.extend({
    components: {
        MediaImporter,
    },
});
</script>
