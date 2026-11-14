<template>
    <Page>
        <article class="flex flex-row gap-6">
            <MediaImage :url="movie.posterUrl" class="aspect-2/3 w-64 shrink-0 rounded shadow" />
            <div class="flex flex-1 flex-col">
                <div class="flex items-center justify-between gap-2">
                    <PageTitle>
                        {{ movie.title }}
                        <span v-if="movie.releaseYear" class="text-lg font-medium"> ({{ movie.releaseYear }}) </span>
                    </PageTitle>
                    <i-mdi-sync v-if="syncing" class="m-2.5 size-5 animate-spin" />
                    <DropdownMenu v-else align="end" :options="menuOptions">
                        <Button size="icon" variant="ghost" :title="$t('movies.openActionsMenu')" class="-mr-4">
                            <i-mdi-dots-vertical class="size-5" />
                            <span class="sr-only">{{ $t('movies.openActionsMenu') }}</span>
                        </Button>
                    </DropdownMenu>
                </div>
                <div class="mt-1 flex flex-wrap items-center gap-x-2 text-sm text-gray-600">
                    <span
                        class="flex items-center gap-1 lowercase"
                        :class="{
                            'text-green-700': movie.watchingStatus === 'watched',
                            'text-blue-700': movie.watchingStatus === 'pending',
                            'text-gray-700': movie.watchingStatus === 'dropped',
                        }"
                        :title="watchingStatusTitle"
                    >
                        <i-material-symbols-check v-if="movie.watchingStatus === 'watched'" class="size-4" />
                        <i-ph-archive-fill v-else-if="movie.watchingStatus === 'dropped'" class="size-4" />
                        <i-mdi-clock-outline v-else class="size-4" />
                        {{
                            movie.watchingStatus === 'pending'
                                ? $t('movies.watchLater')
                                : movie.watchCount > 1
                                  ? $t('movies.watchedTimes', { count: movie.watchCount })
                                  : $t(`movies.${movie.watchingStatus}`)
                        }}
                    </span>
                    <template v-if="movie.runtimeMinutes">
                        <span aria-hidden="true">·</span>
                        <span>{{ formatDuration({ minutes: movie.runtimeMinutes }) }}</span>
                    </template>
                    <template v-if="movie.watchingStatus !== 'pending' || movie.rating !== null">
                        <span aria-hidden="true">·</span>
                        <MediaRating
                            :model-value="movie.rating"
                            class="-ml-0.5"
                            @update:model-value="(rating) => movie.updateRating(rating)"
                        />
                    </template>
                </div>
                <p v-if="movie.description" class="mt-4 leading-relaxed text-gray-700">
                    {{ movie.description }}
                </p>
                <div class="min-h-6 flex-1" />

                <div class="flex items-end gap-6">
                    <dl
                        v-if="movie.directors?.length || details.length > 0"
                        class="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm"
                        :aria-label="$t('movies.details.title')"
                    >
                        <template v-if="movie.directors?.length">
                            <dt class="font-medium text-gray-900">
                                {{ $t('movies.details.directedBy') }}
                            </dt>
                            <dd class="text-gray-700">
                                <template v-for="(director, index) in movie.directors" :key="director.url">
                                    <MaybeLink
                                        :href="director.tmdbUrl"
                                        target="_blank"
                                        rel="noopener"
                                        class="focus-visible:ring-focus rounded focus-visible:ring-2 focus-visible:outline-none"
                                        :class="director.tmdbUrl ? 'hover:underline' : ''"
                                    >
                                        {{ director.name }}
                                    </MaybeLink>
                                    <template v-if="index < movie.directors.length - 1">, </template>
                                </template>
                            </dd>
                        </template>
                        <template v-for="detail in details" :key="detail.label">
                            <dt class="font-medium text-gray-900">{{ detail.label }}</dt>
                            <dd class="text-gray-700">{{ detail.value }}</dd>
                        </template>
                    </dl>
                    <ul :aria-label="$t('movies.externalSites')" class="ml-auto flex items-center gap-2">
                        <li v-for="(url, index) in movie.externalUrls" :key="index">
                            <ExternalSiteLink :url />
                        </li>
                    </ul>
                </div>
            </div>
        </article>
        <section v-if="movie.notes" class="mt-10" aria-labelledby="notes">
            <SectionTitle id="notes">{{ $t('media.notes.title') }}</SectionTitle>
            <Markdown :text="movie.notes" class="mt-4 max-w-none wrap-break-word text-gray-700" />
        </section>
        <section v-if="cast.length" class="mt-10" aria-labelledby="cast">
            <SectionTitle id="cast">{{ $t('movies.details.topCast') }}</SectionTitle>
            <ul class="mt-4 grid grid-cols-6 gap-4 sm:grid-cols-3 md:grid-cols-6">
                <li v-for="role in cast" :key="role.url">
                    <PersonCard :person="role.actor" :characters="role.characterNames" />
                </li>
            </ul>
        </section>
    </Page>
</template>

<script setup lang="ts">
import { translate, UI, useLoading } from '@aerogel/core';
import { Router } from '@aerogel/plugin-routing';
import { arrayFilter } from '@noeldemartin/utils';
import type { ModelWithUrl } from 'soukai-bis';
import { computed, onMounted } from 'vue';
import IconCheck from '~icons/material-symbols/check';
import IconClock from '~icons/mdi/clock-outline';
import IconRewatch from '~icons/mdi/repeat';
import IconSync from '~icons/mdi/sync';
import IconArchive from '~icons/ph/archive-fill';
import IconDetach from '~icons/ph/link-break-bold';
import IconIdentify from '~icons/ph/list-magnifying-glass';
import IconManageLists from '~icons/ph/list-plus';
import IconNotes from '~icons/ph/note-pencil';
import IconDelete from '~icons/ph/trash';

import MediaIdentifyModal from '@/components/modals/MediaIdentifyModal.vue';
import MediaNotesModal from '@/components/modals/MediaNotesModal.vue';
import { formatDate, formatDuration, formatCountries, formatGenres, formatLanguages } from '@/lib/formatting';
import type PerformanceRole from '@/models/PerformanceRole';
import type Person from '@/models/Person';
import Catalog from '@/services/Catalog';
import type { TMDBMovie, TMDBShow } from '@/services/TMDB';
import ListManageModal from '@lists/components/modals/ListManageModal.vue';
import Lists from '@lists/services/Lists';
import Movie from '@movies/models/Movie';
import type { MovieWatchingStatus } from '@movies/models/WatchAction';

const { movie } = defineProps<{ movie: ModelWithUrl<Movie> }>();
const { loading: syncing, run: runSync } = useLoading();
const watchingStatusOptions = computed(() => {
    const statuses = [
        {
            value: 'watched' as const,
            label: translate('movies.watch'),
            icon: IconCheck,
        },
        {
            value: 'dropped' as const,
            label: translate('movies.markAsDropped'),
            icon: IconArchive,
        },
        {
            value: 'pending' as const,
            label: translate('movies.watchLater'),
            icon: IconClock,
        },
    ];

    const options = statuses
        .filter((status) => status.value !== movie.watchingStatus)
        .map((status) => ({
            label: status.label,
            icon: status.icon,
            click: () => updateWatchingStatus(status.value),
        }));

    if (movie.watchingStatus === 'watched') {
        options.unshift({ label: translate('movies.rewatch'), icon: IconRewatch, click: rewatch });
    }

    return options;
});
const watchingStatusTitle = computed(() => {
    if (movie.watchCount > 1) {
        const dates = movie.watches.map((watch) =>
            watch.endTime ? formatDate(watch.endTime) : translate('movies.unknownWatchDate'),
        );

        return [translate('movies.watchedOnDates'), ...dates].join('\n');
    }

    if (movie.watchedAt) {
        return translate('movies.watchedAt', { date: formatDate(movie.watchedAt) });
    }

    if (movie.droppedAt) {
        return translate('movies.droppedAt', { date: formatDate(movie.droppedAt) });
    }

    return undefined;
});
const menuOptions = computed(() =>
    arrayFilter([
        ...watchingStatusOptions.value,
        {
            label: translate('lists.manage.action'),
            icon: IconManageLists,
            click: () => UI.modal(ListManageModal, { media: movie }),
        },
        {
            label: movie.notes ? translate('media.notes.edit') : translate('media.notes.add'),
            icon: IconNotes,
            click: () => UI.modal(MediaNotesModal, { media: movie }),
        },
        {
            label: translate('media.synchronize'),
            icon: IconSync,
            click: () => runSync(Catalog.sync(movie)),
        },
        {
            label: translate('media.identify.title'),
            icon: IconIdentify,
            click: identify,
        },
        movie.tmdbId && {
            label: translate('media.detach.action'),
            icon: IconDetach,
            click: detach,
        },
        {
            label: translate('movies.delete.action'),
            icon: IconDelete,
            click: deleteMovie,
        },
    ]),
);

const cast = computed(() =>
    (movie.cast ?? []).filter((role): role is PerformanceRole & { actor: Person } => !!role.actor),
);

const details = computed(() => {
    return [
        {
            label: translate('movies.details.genres'),
            value: formatGenres(movie.genreKeys),
        },
        {
            label: translate('movies.details.countries'),
            value: formatCountries(movie.countryCodes),
        },
        {
            label: translate('movies.details.languages'),
            value: formatLanguages(movie.languages),
        },
    ].filter((detail) => detail.value);
});

async function updateWatchingStatus(status: MovieWatchingStatus) {
    if (
        movie.watchCount > 1 &&
        !(await UI.confirm(
            translate('movies.resetWatchHistory.title'),
            translate(`movies.resetWatchHistory.${status}`, { count: movie.watchCount }),
            { acceptVariant: 'danger', acceptText: translate('movies.resetWatchHistory.accept') },
        ))
    ) {
        return;
    }

    await movie.updateWatchingStatus(status);
}

async function rewatch() {
    await movie.rewatch();

    UI.toast(translate('movies.rewatched', { movie: movie.title }));
}

async function identify() {
    const { media } = await UI.modal(MediaIdentifyModal, { initialQuery: movie.title });

    if (!media) {
        return;
    }

    if ('name' in media) {
        await identifyAsShow(media);

        return;
    }

    await identifyAsMovie(media);
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
        movie.update({
            externalUrls: movie.externalUrls.filter((url) => !url.includes('themoviedb.org')),
        }),
    );
}

async function deleteMovie() {
    if (
        !(await UI.confirm(translate('movies.delete.title'), translate('movies.delete.message'), {
            acceptVariant: 'danger',
            acceptText: translate('movies.delete.accept'),
        }))
    ) {
        return;
    }

    await runSync(movie.delete());
    await Router.push('/movies');

    UI.toast(translate('movies.delete.success', { movie: movie.title }));
}

async function identifyAsMovie(tmdbMovie: TMDBMovie) {
    await runSync(Catalog.identify(movie, tmdbMovie));
}

async function identifyAsShow(tmdbShow: TMDBShow) {
    if (
        !(await UI.confirm(translate('movies.identifyAsShow.title'), translate('movies.identifyAsShow.message'), {
            acceptVariant: 'danger',
            acceptText: translate('movies.identifyAsShow.accept'),
        }))
    ) {
        return;
    }

    await runSync(async () => {
        const show = await Catalog.importShowFromTMDB(tmdbShow, {
            watchingStatus: movie.watchingStatus === 'watched' ? 'completed' : movie.watchingStatus,
            rating: movie.rating,
            notes: movie.notes,
        });

        await Lists.replaceInLists(movie, show);
        await Router.push(show.route);
        await movie.delete();
    });
}

onMounted(() => movie.loadAllRelationsIfUnloaded());
</script>
