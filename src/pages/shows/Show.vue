<template>
    <Page>
        <article class="flex flex-row gap-6">
            <MediaImage :url="show.posterUrl" class="aspect-2/3 w-64 shrink-0 rounded shadow" />
            <div class="flex flex-1 flex-col">
                <div class="flex items-center justify-between gap-2">
                    <h1 class="text-2xl font-semibold text-gray-900">
                        {{ show.name }}
                        <span v-if="show.releaseYear" class="text-lg font-medium"> ({{ show.releaseYear }}) </span>
                    </h1>
                    <i-mdi-sync v-if="syncing" class="m-2.5 size-5 animate-spin" />
                    <DropdownMenu v-else align="end" :options="menuOptions">
                        <Button size="icon" variant="ghost" :title="$t('shows.openActionsMenu')" class="-mr-4">
                            <i-mdi-dots-vertical class="size-5" />
                            <span class="sr-only">{{ $t('shows.openActionsMenu') }}</span>
                        </Button>
                    </DropdownMenu>
                </div>
                <div class="mt-1 flex flex-wrap items-center gap-x-2 text-sm text-gray-600">
                    <ShowWatchingStatus :status="show.watchingStatus" class="lowercase">
                        <ShowPendingEpisodesCount
                            v-if="show.watchingStatus === 'watching'"
                            :show
                            lang-key="shows.upcomingEpisodes"
                        />
                    </ShowWatchingStatus>
                    <template v-if="show.numberOfSeasons">
                        <span aria-hidden="true">·</span>
                        <span>{{ $t('shows.seasonsCount', { count: show.numberOfSeasons }) }}</span>
                    </template>
                    <template v-if="show.numberOfEpisodes">
                        <span aria-hidden="true">·</span>
                        <span>{{ $t('shows.episodesCount', { count: show.numberOfEpisodes }) }}</span>
                    </template>
                </div>
                <p v-if="show.description" class="mt-4 leading-relaxed text-gray-700">
                    {{ show.description }}
                </p>
                <div class="min-h-6 flex-1" />

                <div class="flex items-end gap-6">
                    <dl
                        v-if="show.creators?.length || details.length > 0"
                        class="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm"
                        :aria-label="$t('shows.details.title')"
                    >
                        <template v-if="show.creators?.length">
                            <dt class="font-medium text-gray-900">
                                {{ $t('shows.details.createdBy') }}
                            </dt>
                            <dd class="text-gray-700">
                                <template v-for="(creator, index) in show.creators" :key="creator.url">
                                    <MaybeLink
                                        :href="creator.tmdbUrl"
                                        target="_blank"
                                        rel="noopener"
                                        class="focus-visible:ring-focus rounded focus-visible:ring-2 focus-visible:outline-none"
                                        :class="creator.tmdbUrl ? 'hover:underline' : ''"
                                    >
                                        {{ creator.name }}
                                    </MaybeLink>
                                    <template v-if="index < show.creators.length - 1">, </template>
                                </template>
                            </dd>
                        </template>
                        <template v-for="detail in details" :key="detail.label">
                            <dt class="font-medium text-gray-900">{{ detail.label }}</dt>
                            <dd class="text-gray-700">{{ detail.value }}</dd>
                        </template>
                    </dl>
                    <ul :aria-label="$t('shows.externalSites')" class="ml-auto flex items-center gap-2">
                        <li v-for="(url, index) in show.externalUrls" :key="index">
                            <ExternalSiteLink :url />
                        </li>
                    </ul>
                </div>
            </div>
        </article>
        <section v-if="cast.length" class="mt-10" aria-labelledby="cast">
            <h2 id="cast" class="text-xl font-semibold text-gray-900">{{ $t('shows.details.topCast') }}</h2>
            <ul class="mt-4 grid grid-cols-6 gap-4 sm:grid-cols-3 md:grid-cols-6">
                <li v-for="role in cast" :key="role.url">
                    <PersonCard :person="role.actor" :characters="role.characterNames" />
                </li>
            </ul>
        </section>
        <section
            v-if="seasons && !$catalog.ignoresSeasons(show.watchingStatus)"
            class="mt-10"
            aria-labelledby="seasons"
        >
            <h2 id="seasons" class="text-xl font-semibold text-gray-900">{{ $t('shows.seasons') }}</h2>
            <p v-if="seasons.length === 0" class="mt-4 text-sm text-gray-500">{{ $t('shows.noSeasons') }}</p>
            <div v-else class="mt-6 flex flex-col gap-8">
                <ShowSeason
                    v-for="season of seasons"
                    :key="season.url"
                    :season
                    :open="defaultSeason?.url === season.url"
                />
            </div>
        </section>
    </Page>
</template>

<script setup lang="ts">
import { translate, UI, useLoading } from '@aerogel/core';
import { Router } from '@aerogel/plugin-routing';
import { arrayFilter, arraySorted } from '@noeldemartin/utils';
import { computed, onMounted } from 'vue';
import IconCheck from '~icons/material-symbols/check';
import IconClock from '~icons/mdi/clock-outline';
import IconPlay from '~icons/mdi/play-circle-outline';
import IconSync from '~icons/mdi/sync';
import IconArchive from '~icons/ph/archive-fill';
import IconDetach from '~icons/ph/link-break-bold';
import IconIdentify from '~icons/ph/list-magnifying-glass';
import IconDelete from '~icons/ph/trash';

import IdentifyMediaModal from '@/components/modals/IdentifyMediaModal.vue';
import { formatCountries, formatGenres, formatLanguages } from '@/lib/media';
import type PerformanceRole from '@/models/PerformanceRole';
import type Person from '@/models/Person';
import Show from '@/models/Show';
import Catalog from '@/services/Catalog';
import type { TMDBMovie, TMDBShow } from '@/services/TMDB';

const { show } = defineProps<{ show: Show }>();
const { loading: syncing, run: runSync } = useLoading();
const seasons = computed(() => show.seasons && arraySorted(show.seasons, 'number'));
const watchingStatusOptions = computed(() => {
    const statuses = [
        {
            value: 'watching' as const,
            label: translate('shows.markAsWatching'),
            icon: IconPlay,
        },
        {
            value: 'completed' as const,
            label: translate('shows.markAsCompleted'),
            icon: IconCheck,
        },
        {
            value: 'dropped' as const,
            label: translate('shows.markAsDropped'),
            icon: IconArchive,
        },
        {
            value: 'pending' as const,
            label: translate('shows.markAsPending'),
            icon: IconClock,
        },
    ];

    return statuses
        .filter((status) => status.value !== show.watchingStatus)
        .map((status) => ({
            label: status.label,
            icon: status.icon,
            async click() {
                await show.updateWatchingStatus(status.value);

                if (await Catalog.needsSync(show)) {
                    await sync();
                }
            },
        }));
});
const menuOptions = computed(() =>
    arrayFilter([
        ...watchingStatusOptions.value,
        {
            label: translate('media.synchronize'),
            icon: IconSync,
            click: sync,
        },
        {
            label: translate('media.identify.title'),
            icon: IconIdentify,
            click: identify,
        },
        show.tmdbId && {
            label: translate('media.detach.action'),
            icon: IconDetach,
            click: detach,
        },
        {
            label: translate('shows.delete.action'),
            icon: IconDelete,
            click: deleteShow,
        },
    ]),
);

const defaultSeason = computed(() => {
    const seasonsWithoutSpecials = seasons.value?.filter((season) => season.number !== 0) ?? [];
    const firstUnwatchedSeason = seasonsWithoutSpecials.find((season) =>
        season.episodes?.some((episode) => !episode.watched),
    );

    return firstUnwatchedSeason ?? seasonsWithoutSpecials.at(-1) ?? seasons.value?.at(-1);
});

const cast = computed(() =>
    (show.cast ?? []).filter((role): role is PerformanceRole & { actor: Person } => !!role.actor),
);
const details = computed(() => {
    return [
        {
            label: translate('shows.details.genres'),
            value: formatGenres(show.genreIds),
        },
        {
            label: translate('shows.details.countries'),
            value: formatCountries(show.countryCodes),
        },
        {
            label: translate('shows.details.languages'),
            value: formatLanguages(show.languages),
        },
    ].filter((detail) => detail.value);
});

async function sync() {
    await runSync(Catalog.sync(show));
}

async function identify() {
    const { media } = await UI.modal(IdentifyMediaModal, { initialQuery: show.name });

    if (!media) {
        return;
    }

    if ('title' in media) {
        await identifyAsMovie(media);

        return;
    }

    await identifyAsShow(media);
}

async function detach() {
    if (
        !(await UI.confirm(translate('media.detach.title'), translate('media.detach.message'), {
            acceptVariant: 'danger',
            acceptText: translate('media.detach.accept'),
        }))
    ) {
        return;
    }

    await runSync(
        show.update({
            externalUrls: show.externalUrls.filter((url) => !url.includes('themoviedb.org')),
        }),
    );
}

async function deleteShow() {
    if (
        !(await UI.confirm(translate('shows.delete.title'), translate('shows.delete.message'), {
            acceptVariant: 'danger',
            acceptText: translate('shows.delete.accept'),
        }))
    ) {
        return;
    }

    await runSync(show.deleteWithRelations());
    await Router.push('/shows');

    UI.toast(translate('shows.delete.success', { show: show.name }));
}

async function identifyAsShow(tmdbShow: TMDBShow) {
    const originalSlug = show.slug;

    await runSync(Catalog.identify(show, tmdbShow));

    if (originalSlug === show.slug) {
        return;
    }

    await Router.replace(show.route);
}

async function identifyAsMovie(tmdbMovie: TMDBMovie) {
    if (
        !(await UI.confirm(translate('shows.identifyAsMovie.title'), translate('shows.identifyAsMovie.message'), {
            acceptVariant: 'danger',
            acceptText: translate('shows.identifyAsMovie.accept'),
        }))
    ) {
        return;
    }

    await runSync(async () => {
        const movie = await Catalog.importMovieFromTMDB(tmdbMovie, {
            watched: show.watchingStatus === 'completed',
        });

        await Router.push(movie.route);
        await show.deleteWithRelations();
    });
}

onMounted(() => show.loadAllRelationsIfUnloaded());
</script>
