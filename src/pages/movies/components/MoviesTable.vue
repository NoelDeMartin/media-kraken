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
import { Lang, useDataTable } from '@aerogel/core';
import { isTruthy } from '@noeldemartin/utils';
import { computed } from 'vue';

import { formatCountry, formatDate, formatDuration, formatLanguage } from '@/lib/formatting';
import Movie from '@/models/Movie';
import TMDB from '@/services/TMDB';

const { movies } = defineProps<{ movies: Movie[] }>();
const renderedMovies = computed(() =>
    movies.map((movie) => ({
        ...movie.getAttributes(),
        slug: movie.slug,
        genres: movie.genreIds
            .map((id) => Lang.locale && TMDB.genreTranslations[Lang.locale]?.[id])
            .filter(isTruthy)
            .join(', '),
        countries: movie.countryCodes.map((code) => formatCountry(code)).join(', '),
        languages: movie.languages.map((language) => formatLanguage(language)).join(', '),
        runtimeMinutes: movie.runtimeMinutes,
        releaseYear: movie.releaseYear,
        watchedAt: movie.watchedAt,
    })),
);
const { Table, TableColumn } = useDataTable(renderedMovies);
</script>
