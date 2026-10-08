<template>
    <Table item-key="url" :items-label="$t('movies.itemsName')">
        <TableColumn :header="$t('movies.table.title')" field="title">
            <template #default="{ item: movie }">
                <Link class="text-normal" :to="movie.route">
                    {{ movie.title }}
                </Link>
            </template>
        </TableColumn>
        <TableColumn :header="$t('movies.table.year')" field="releaseYear" sortable />
        <TableColumn :header="$t('movies.table.duration')" field="runtimeMinutes" sortable>
            <template #default="{ item: movie }">
                <span v-if="movie.runtimeMinutes">{{ formatDuration({ minutes: movie.runtimeMinutes }) }}</span>
                <span v-else>-</span>
            </template>
        </TableColumn>
        <TableColumn :header="$t('movies.table.genres')" field="genres" sortable />
        <TableColumn :header="$t('movies.table.countries')" field="countries" sortable />
        <TableColumn :header="$t('movies.table.languages')" field="languages" sortable />
        <TableColumn :header="$t('movies.table.watched')" field="watchedAt" sortable>
            <template #default="{ item: movie }">
                <span v-if="movie.watchedAt">{{ formatDate(movie.watchedAt) }}</span>
                <span v-else>-</span>
            </template>
        </TableColumn>

        <template v-if="$slots.empty" #empty>
            <slot name="empty" />
        </template>
    </Table>
</template>

<script setup lang="ts">
import { useDataTable } from '@aerogel/core';
import { computed } from 'vue';

import { formatDate, formatDuration } from '@/lib/formatting';
import { formatCountries, formatGenres, formatLanguages } from '@/lib/media';
import Movie from '@/models/Movie';

const { movies } = defineProps<{ movies: Movie[] }>();
const renderedMovies = computed(() =>
    movies.map((movie) => ({
        ...movie.getAttributes(),
        route: movie.route,
        genres: formatGenres(movie.genreIds),
        countries: formatCountries(movie.countryCodes),
        languages: formatLanguages(movie.languages),
        runtimeMinutes: movie.runtimeMinutes,
        releaseYear: movie.releaseYear,
        watchedAt: movie.watchedAt,
    })),
);
const { Table, TableColumn } = useDataTable(renderedMovies);
</script>
