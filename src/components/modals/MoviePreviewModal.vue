<template>
    <Modal :title="movie.title">
        <Button @click="saveToCollection()">{{ $t('movies.watchLater') }}</Button>
    </Modal>
</template>

<script setup lang="ts">
import { translate, UI, useModal } from '@aerogel/core';
import { computed } from 'vue';

import Movie from '@/models/Movie';
import type { TMDBMovie } from '@/services/TMDB';

const { movie } = defineProps<{ movie: TMDBMovie }>();
const { close } = useModal();
const model = computed(() => Movie.fromTMDB(movie, { posterSize: 'large' }));

async function saveToCollection() {
    close();

    await model.value.save();

    UI.toast(translate('movies.added', { movie: model.value.title }));
}
</script>
