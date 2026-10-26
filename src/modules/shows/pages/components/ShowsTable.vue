<template>
    <Table v-model:page="page" item-key="url" :loading :items-label="$t('shows.itemsName')">
        <TableColumn :header="$t('shows.table.name')" field="name">
            <template #default="{ item: show }">
                <Link class="text-normal" :to="show.route">
                    {{ show.name }}
                </Link>
            </template>
        </TableColumn>
        <TableColumn :header="$t('shows.table.year')" field="releaseYear" sortable />
        <TableColumn :header="$t('shows.table.seasons')" field="numberOfSeasons" sortable>
            <template #default="{ item: show }">
                <span v-if="show.numberOfSeasons">{{ show.numberOfSeasons }}</span>
                <span v-else>-</span>
            </template>
        </TableColumn>
        <TableColumn :header="$t('shows.table.episodes')" field="numberOfEpisodes" sortable>
            <template #default="{ item: show }">
                <span v-if="show.numberOfEpisodes">{{ show.numberOfEpisodes }}</span>
                <span v-else>-</span>
            </template>
        </TableColumn>
        <TableColumn :header="$t('shows.table.genres')" field="genres" sortable />
        <TableColumn :header="$t('shows.table.countries')" field="countries" sortable />
        <TableColumn :header="$t('shows.table.languages')" field="languages" sortable />
        <TableColumn :header="$t('shows.table.status')" field="status" sortable>
            <template #default="{ item: show }">
                <ShowWatchingStatus :status="show.watchingStatus" />
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
import { translate, useDataTable } from '@aerogel/core';
import { computed } from 'vue';

import { formatCountries, formatGenres, formatLanguages } from '@/lib/formatting';
import Show from '@shows/models/Show';

const { shows, loading } = defineProps<{ shows: Show[]; loading?: boolean }>();
const page = defineModel<number>('page', { default: 1 });
const renderedShows = computed(() =>
    shows.map((show) => ({
        ...show.getAttributes(),
        route: show.route,
        genres: formatGenres(show.genreKeys),
        countries: formatCountries(show.countryCodes),
        languages: formatLanguages(show.languages),
        releaseYear: show.releaseYear,
        numberOfSeasons: show.numberOfSeasons,
        numberOfEpisodes: show.numberOfEpisodes,
        watchingStatus: show.watchingStatus,
        status: translate(`shows.statuses.${show.watchingStatus}`),
        rating: show.rating,
    })),
);
const { Table, TableColumn } = useDataTable(renderedShows);
</script>
