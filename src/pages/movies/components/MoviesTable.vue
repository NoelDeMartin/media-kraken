<template>
    <Table item-key="url" :items-label="$t('movies.itemsName')">
        <TableColumn :header="$t('movies.table.title')" field="title">
            <template #default="{ item: movie }">
                <Link
                    class="text-normal"
                    route="movies.show"
                    :route-params="{ movie: movie.slug }"
                    :route-query="$solid.hasLoggedIn() ? { url: movie.url } : undefined"
                >
                    {{ movie.title }}
                </Link>
            </template>
        </TableColumn>
        <TableColumn :header="$t('movies.table.year')" field="releaseYear" sortable />
        <TableColumn :header="$t('movies.table.watched')" field="watchedAt" sortable>
            <template #default="{ item: movie }">
                <span v-if="movie.watchedAt">{{ formatDate(movie.watchedAt) }}</span>
                <span v-else>-</span>
            </template>
        </TableColumn>
    </Table>
</template>

<script setup lang="ts">
import { useDataTable } from '@aerogel/core';

import { formatDate } from '@/lib/formatting';
import Movie from '@/models/Movie';

const { movies } = defineProps<{ movies: Movie[] }>();
const { Table, TableColumn } = useDataTable(() => movies);
</script>
