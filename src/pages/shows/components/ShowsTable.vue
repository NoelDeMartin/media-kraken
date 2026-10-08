<template>
    <Table item-key="url" :items-label="$t('shows.itemsName')">
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

        <template v-if="$slots.empty" #empty>
            <slot name="empty" />
        </template>
    </Table>
</template>

<script setup lang="ts">
import { translate, useDataTable } from '@aerogel/core';
import { computed } from 'vue';

import { formatCountries, formatGenres, formatLanguages } from '@/lib/media';
import Show from '@/models/Show';

const { shows } = defineProps<{ shows: Show[] }>();
const renderedShows = computed(() =>
    shows.map((show) => ({
        ...show.getAttributes(),
        route: show.route,
        genres: formatGenres(show.genreIds),
        countries: formatCountries(show.countryCodes),
        languages: formatLanguages(show.languages),
        releaseYear: show.releaseYear,
        numberOfSeasons: show.numberOfSeasons,
        numberOfEpisodes: show.numberOfEpisodes,
        watchingStatus: show.watchingStatus,
        status: translate(`shows.statuses.${show.watchingStatus}`),
    })),
);
const { Table, TableColumn } = useDataTable(renderedShows);
</script>
