<template>
    <Modal :title="$t('import.imdb.title')" persistent>
        <p class="text-sm text-gray-600">
            {{ $t('import.imdb.description') }}
        </p>
        <Form :form @submit="submit">
            <TextArea
                name="urls"
                rows="8"
                class="mt-2"
                label-class="sr-only"
                :label="$t('import.imdb.urls')"
                :placeholder="$t('import.imdb.placeholder')"
            />
            <div class="mt-4 flex justify-end gap-2">
                <Button variant="secondary" @click="close()">
                    {{ $t('ui.cancel') }}
                </Button>
                <Button submit :disabled="!form.urls?.trim()">
                    {{ $t('import.imdb.submit') }}
                </Button>
            </div>
        </Form>
    </Modal>
</template>

<script setup lang="ts">
import { requiredStringInput, useForm, useModal } from '@aerogel/core';

type Match = { imdbId: string; url: string };
type Result = { matches: Match[] };

defineEmits<{ close: [Result] }>();

const { close } = useModal<Result>();
const form = useForm({ urls: requiredStringInput() });

function submit() {
    let match: RegExpExecArray | null;
    const matches: Match[] = [];
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:m\.)?imdb\.com\/title\/([a-zA-Z0-9]+)/g;

    while ((match = regex.exec(form.urls)) !== null) {
        matches.push({ imdbId: String(match[1]), url: match[0] });
    }

    close({ matches });
}
</script>
