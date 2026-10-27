<template>
    <Modal :title="list ? $t('lists.edit.title') : $t('lists.create.title')" persistent>
        <Form :form @submit="submit()">
            <Input name="name" :label="$t('lists.name')" :placeholder="$t('lists.namePlaceholder')" />
            <TextArea
                name="description"
                rows="5"
                class="mt-4"
                :label="$t('lists.description')"
                :placeholder="$t('lists.descriptionPlaceholder')"
            />
            <div class="mt-4 flex justify-end gap-2">
                <Button variant="secondary" :disabled="saving" @click="close()">
                    {{ $t('ui.cancel') }}
                </Button>
                <Button submit :disabled="!form.name.trim()" :loading="saving">
                    {{ list ? $t('lists.edit.accept') : $t('lists.create.accept') }}
                </Button>
            </div>
        </Form>
    </Modal>
</template>

<script setup lang="ts">
import { useForm, useModal } from '@aerogel/core';
import type { ModelWithUrl } from 'soukai-bis';
import { ref } from 'vue';
import { z } from 'zod';

import List from '@lists/models/List';

type Result = { list: ModelWithUrl<List> };

defineEmits<{ close: [Result] }>();

const { list } = defineProps<{ list?: List }>();
const { close } = useModal<Result>();
const saving = ref(false);
const form = useForm({
    name: z.string().default(list?.name ?? ''),
    description: z
        .string()
        .nullable()
        .default(list?.description ?? null),
});

async function submit() {
    const attributes = {
        name: form.name.trim(),
        description: form.description?.trim() || undefined,
    };

    saving.value = true;

    try {
        if (list) {
            const updatedList = await list.update(attributes);

            close({ list: updatedList });

            return;
        }

        const newList = await List.create(attributes);

        close({ list: newList });
    } finally {
        saving.value = false;
    }
}
</script>
