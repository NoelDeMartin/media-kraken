<template>
    <Table v-model:page="page" v-model:sort-by="sortBy" item-key="url" :loading :items-label="$t('movies.itemsName')">
        <TableColumn :header="$t('movies.table.title')" field="title" sortable>
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
                <span v-if="movie.watchDates.length > 0" class="flex flex-col">
                    <span v-for="(date, index) in movie.watchDates" :key="index">
                        {{ date ? formatDate(date) : $t('movies.unknownWatchDate') }}
                    </span>
                </span>
                <span v-else>-</span>
            </template>
        </TableColumn>
        <TableColumn :header="$t('media.rating.label')" field="rating" sortable>
            <template #default="{ item }">
                <MediaRating v-if="item.rating !== null" :model-value="item.rating" size="sm" readonly />
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
import type { SortedColumn } from '@aerogel/core';
import { computed } from 'vue';

import { formatDate, formatDuration } from '@/lib/formatting';
import { renderMovieTableItem, type MovieTableItem } from '@/modules/movies/lib/movies';
import Movie from '@movies/models/Movie';

const { movies, loading } = defineProps<{ movies: Movie[]; loading?: boolean }>();
const page = defineModel<number>('page', { default: 1 });
const sortBy = defineModel<SortedColumn<MovieTableItem>[]>('sortBy', { default: () => [] });
const renderedMovies = computed(() => movies.map(renderMovieTableItem));
const { Table, TableColumn } = useDataTable(renderedMovies);
</script>
