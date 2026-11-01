<template>
    <Table v-model:page="page" v-model:sort-by="sortBy" item-key="url" :loading :items-label="$t('shows.itemsName')">
        <TableColumn :header="$t('shows.table.name')" field="name" sortable>
            <template #default="{ item: show }">
                <span class="inline-flex items-center gap-1.5">
                    <Link class="text-normal" :to="show.route">
                        {{ show.name }}
                    </Link>
                    <span v-if="show.hasNotes" :title="show.notesPreview" class="flex">
                        <i-material-symbols-description-rounded aria-hidden="true" class="size-4 text-gray-400" />
                        <span class="sr-only">{{ $t('media.notes.hasNotes') }}</span>
                    </span>
                </span>
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
import { useDataTable } from '@aerogel/core';
import type { SortedColumn } from '@aerogel/core';
import { computed } from 'vue';

import { renderShowTableItem, type ShowTableItem } from '@/modules/shows/lib/shows';
import Show from '@shows/models/Show';

const { shows, loading } = defineProps<{ shows: Show[]; loading?: boolean }>();
const page = defineModel<number>('page', { default: 1 });
const sortBy = defineModel<SortedColumn<ShowTableItem>[]>('sortBy', { default: () => [] });
const renderedShows = computed(() => shows.map(renderShowTableItem));
const { Table, TableColumn } = useDataTable(renderedShows);
</script>
