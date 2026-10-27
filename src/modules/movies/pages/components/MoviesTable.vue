<template>
    <Table v-model:page="page" item-key="url" :loading :items-label="$t('movies.itemsName')">
        <TableColumn :header="$t('movies.table.title')" field="title">
            <template #default="{ item: movie }">
                <span class="inline-flex items-center gap-1.5">
                    <Link class="text-normal" :to="movie.route">
                        {{ movie.title }}
                    </Link>
                    <span v-if="movie.hasNotes" :title="movie.notesPreview" class="flex">
                        <i-material-symbols-description-rounded aria-hidden="true" class="size-4 text-gray-400" />
                        <span class="sr-only">{{ $t('media.notes.hasNotes') }}</span>
                    </span>
                </span>
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
        <TableColumn :header="$t('media.rating.label')" field="rating" sortable>
            <template #default="{ item }">
                <MediaRating v-if="item.rating !== null" :model-value="item.rating" readonly />
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

import { formatDate, formatDuration, formatCountries, formatGenres, formatLanguages } from '@/lib/formatting';
import { notesPreview } from '@/lib/media';
import Movie from '@movies/models/Movie';

const { movies, loading } = defineProps<{ movies: Movie[]; loading?: boolean }>();
const page = defineModel<number>('page', { default: 1 });
const renderedMovies = computed(() =>
    movies.map((movie) => ({
        ...movie.getAttributes(),
        route: movie.route,
        genres: formatGenres(movie.genreKeys),
        countries: formatCountries(movie.countryCodes),
        languages: formatLanguages(movie.languages),
        runtimeMinutes: movie.runtimeMinutes,
        releaseYear: movie.releaseYear,
        watchedAt: movie.watchedAt,
        rating: movie.rating,
        hasNotes: !!movie.notes,
        get notesPreview(): string | undefined {
            return movie.notes ? notesPreview(movie.notes) : undefined;
        },
    })),
);
const { Table, TableColumn } = useDataTable(renderedMovies);
</script>
