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
                            'text-green-700': movie.watched,
                            'text-blue-700': !movie.watched,
                        }"
                        :title="
                            movie.watchedAt ? $t('movies.watchedAt', { date: formatDate(movie.watchedAt) }) : undefined
                        "
                    >
                        <i-material-symbols-check v-if="movie.watched" class="size-4" />
                        <i-mdi-clock-outline v-else class="size-4" />
                        {{ movie.watched ? $t('movies.watched') : $t('movies.watchLater') }}
                    </span>
                    <template v-if="movie.runtimeMinutes">
                        <span aria-hidden="true">·</span>
                        <span>{{ formatDuration({ minutes: movie.runtimeMinutes }) }}</span>
                    </template>
                    <template v-if="movie.watched || movie.rating !== null">
                        <span aria-hidden="true">·</span>
                        <MediaRating
                            :model-value="movie.rating"
                            size="sm"
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
import IconSync from '~icons/mdi/sync';
import IconDetach from '~icons/ph/link-break-bold';
import IconIdentify from '~icons/ph/list-magnifying-glass';
import IconManageLists from '~icons/ph/list-plus';
import IconNotes from '~icons/ph/note-pencil';
import IconDelete from '~icons/ph/trash';

import IdentifyMediaModal from '@/components/modals/IdentifyMediaModal.vue';
import MediaNotesModal from '@/components/modals/MediaNotesModal.vue';
import { formatDate, formatDuration, formatCountries, formatGenres, formatLanguages } from '@/lib/formatting';
import type PerformanceRole from '@/models/PerformanceRole';
import type Person from '@/models/Person';
import Catalog from '@/services/Catalog';
import type { TMDBMovie, TMDBShow } from '@/services/TMDB';
import ManageListsModal from '@lists/components/modals/ManageListsModal.vue';
import { removeFromLists, replaceInLists } from '@lists/lib/lists';
import Movie from '@movies/models/Movie';

const { movie } = defineProps<{ movie: ModelWithUrl<Movie> }>();
const { loading: syncing, run: runSync } = useLoading();
const menuOptions = computed(() =>
    arrayFilter([
        movie.watched
            ? {
                  label: translate('movies.watchLater'),
                  icon: IconClock,
                  click: () => movie.unwatch(),
              }
            : {
                  label: translate('movies.watch'),
                  icon: IconCheck,
                  click: () => movie.watch(),
              },
        {
            label: translate('lists.manage.action'),
            icon: IconManageLists,
            click: () => UI.modal(ManageListsModal, { media: movie }),
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

async function identify() {
    const { media } = await UI.modal(IdentifyMediaModal, { initialQuery: movie.title });

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

    await runSync(async () => {
        await removeFromLists(movie);
        await movie.deleteWithRelations();
    });
    await Router.push('/movies');

    UI.toast(translate('movies.delete.success', { movie: movie.title }));
}

async function identifyAsMovie(tmdbMovie: TMDBMovie) {
    const originalSlug = movie.slug;

    await runSync(Catalog.identify(movie, tmdbMovie));

    if (originalSlug === movie.slug) {
        return;
    }

    await Router.replace(movie.route);
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
            watchingStatus: movie.watched ? 'completed' : 'pending',
            rating: movie.rating,
            notes: movie.notes,
        });

        await replaceInLists(movie, show);
        await Router.push(show.route);
        await movie.deleteWithRelations();
    });
}

onMounted(() => movie.loadAllRelationsIfUnloaded());
</script>
