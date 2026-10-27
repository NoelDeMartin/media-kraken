<template>
    <Modal :title persistent>
        <Form :form @submit="submit()">
            <TextArea
                name="notes"
                rows="10"
                label-class="sr-only"
                :label="$t('media.notes.title')"
                :placeholder="$t('media.notes.placeholder')"
            />
            <div class="mt-4 flex justify-end gap-2">
                <Button variant="secondary" :disabled="saving" @click="close()">
                    {{ $t('ui.cancel') }}
                </Button>
                <Button submit :loading="saving">
                    {{ $t('media.notes.save') }}
                </Button>
            </div>
        </Form>
    </Modal>
</template>

<script setup lang="ts">
import { translate, useForm, useModal } from '@aerogel/core';
import { ref } from 'vue';
import { z } from 'zod';

import type { Media } from '@/lib/media';

const { media } = defineProps<{ media: Media }>();
const { close } = useModal();
const saving = ref(false);
const title = media.notes ? translate('media.notes.edit') : translate('media.notes.add');
const form = useForm({ notes: z.string().nullable().default(media.notes) });

async function submit() {
    saving.value = true;

    try {
        await media.updateNotes(form.notes);

        close();
    } finally {
        saving.value = false;
    }
}
</script>
