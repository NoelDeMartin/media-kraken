<template>
    <Modal :title="$t('shows.advancedFilters.title')">
        <div v-if="!creditsReady" class="py-12">
            <i-svg-spinners-3-dots-scale-middle class="text-primary h-8 w-full" />
        </div>
        <Form v-else :form @submit="submit">
            <div class="space-y-4">
                <Select
                    name="watchingStatus"
                    :label="$t('shows.advancedFilters.watchingStatus')"
                    :options="statusOptions"
                    :render-option="renderStatus"
                />
                <Combobox
                    name="genres"
                    :label="$t('shows.advancedFilters.genre')"
                    :placeholder="$t('shows.advancedFilters.allGenres')"
                    :options="genreOptions"
                    :render-option="formatGenre"
                />
                <Combobox
                    name="creators"
                    :label="$t('shows.advancedFilters.creator')"
                    :placeholder="$t('shows.advancedFilters.allCreators')"
                    :options="creatorOptions"
                    :render-option="renderPerson"
                />
                <Combobox
                    name="cast"
                    :label="$t('shows.advancedFilters.cast')"
                    :placeholder="$t('shows.advancedFilters.allCast')"
                    :options="castOptions"
                    :render-option="renderPerson"
                />
                <Combobox
                    name="countries"
                    :label="$t('shows.advancedFilters.country')"
                    :placeholder="$t('shows.advancedFilters.allCountries')"
                    :options="countryOptions"
                    :render-option="formatCountry"
                />
                <Combobox
                    name="languages"
                    :label="$t('shows.advancedFilters.language')"
                    :placeholder="$t('shows.advancedFilters.allLanguages')"
                    :options="languageOptions"
                    :render-option="formatLanguage"
                />
                <RangeSlider
                    name="releaseYear"
                    :label="$t('shows.advancedFilters.releaseYear')"
                    :min="yearBounds[0]"
                    :max="yearBounds[1]"
                />
                <RangeSlider
                    name="seasons"
                    :label="$t('shows.advancedFilters.seasons')"
                    :min="seasonsBounds[0]"
                    :max="seasonsBounds[1]"
                />
                <RangeSlider
                    name="rating"
                    :label="$t('media.rating.label')"
                    :min="MIN_RATING"
                    :max="MAX_RATING"
                    :format-value="formatRatingAsStars"
                />
            </div>

            <div class="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-4">
                <Button type="button" variant="ghost" class="text-gray-600" @click="form.reset()">
                    {{ $t('shows.advancedFilters.clear') }}
                </Button>
                <div class="flex items-center gap-2">
                    <Button type="button" variant="secondary" @click="close()">
                        {{ $t('ui.cancel') }}
                    </Button>
                    <Button submit>
                        {{ $t('shows.advancedFilters.apply') }}
                    </Button>
                </div>
            </div>
        </Form>
    </Modal>
</template>

<script setup lang="ts">
import { numberRange, translate, useForm, useModal } from '@aerogel/core';
import { isTruthy, type Nullable } from '@noeldemartin/utils';
import { computed, onMounted, ref } from 'vue';
import { z } from 'zod';

import { formatCountry, formatGenre, formatLanguage } from '@/lib/formatting';
import type { GenreKey } from '@/lib/genres';
import { personFilterKey, sortByLocale, uniquePersonKeys } from '@/lib/media';
import { formatRatingAsStars } from '@/lib/stars';
import { MAX_RATING, MIN_RATING } from '@/models/Rating';
import type { ShowsFilter } from '@shows/lib/shows';
import type Show from '@shows/models/Show';
import type { ShowWatchingStatus } from '@shows/models/ShowWatching';

type Result = { filters: ShowsFilter };

const { filters, shows } = defineProps<{
    shows: Show[];
    filters: Nullable<ShowsFilter>;
}>();

defineEmits<{ close: [Result] }>();

const { close } = useModal<Result>();
const initialShowsWithoutCredits = shows.filter((show) => !show.credits.value);
const creditsReady = ref(initialShowsWithoutCredits.length === 0);
const statusOptions = ['all', 'watching', 'completed', 'dropped', 'pending'] as const satisfies (
    | 'all'
    | ShowWatchingStatus
)[];
const form = useForm({
    watchingStatus: z.enum(statusOptions).default('all'),
    genres: z.array(z.custom<GenreKey>()).default([]),
    creators: z.array(z.string()).default([]),
    cast: z.array(z.string()).default([]),
    countries: z.array(z.string()).default([]),
    languages: z.array(z.string()).default([]),
    releaseYear: numberRange(),
    seasons: numberRange(),
    rating: numberRange(),
});

if (filters) {
    form.watchingStatus = filters.watchingStatus ?? 'all';
    form.genres = filters.genres ?? [];
    form.creators = filters.creators ?? [];
    form.cast = filters.cast ?? [];
    form.countries = filters.countries ?? [];
    form.languages = filters.languages ?? [];
    form.releaseYear = filters.releaseYear ?? [null, null];
    form.seasons = filters.seasons ?? [null, null];
    form.rating = filters.rating ?? [null, null];
}

const creators = computed(() => shows.flatMap((show) => show.credits.value?.creators ?? []));
const actors = computed(() => shows.flatMap((show) => show.credits.value?.cast ?? []));
const creatorOptions = computed(() => sortByLocale(uniquePersonKeys(creators.value), renderPerson));
const castOptions = computed(() => sortByLocale(uniquePersonKeys(actors.value), renderPerson));

const genreOptions = computed(() => {
    return sortByLocale(Array.from(new Set(shows.flatMap((show) => show.genreKeys))), formatGenre);
});

const countryOptions = computed(() => {
    return sortByLocale(Array.from(new Set(shows.flatMap((show) => show.countryCodes))), formatCountry);
});

const languageOptions = computed(() => {
    return sortByLocale(Array.from(new Set(shows.flatMap((show) => show.languages))), formatLanguage);
});

const personNames = computed(() => {
    const names = new Map<string, string>();

    for (const person of [...creators.value, ...actors.value]) {
        const key = personFilterKey(person);

        if (key && !names.has(key)) {
            names.set(key, person.name);
        }
    }

    return names;
});

const yearBounds = computed(() => {
    const years = shows.map((show) => show.releaseYear).filter(isTruthy);
    const currentYear = new Date().getFullYear();
    const min = years.length > 0 ? Math.min(...years) : 1900;
    const max = years.length > 0 ? Math.max(...years) : currentYear;

    return [min, Math.max(max, min + 1)] as const;
});

const seasonsBounds = computed(() => {
    const seasons = shows.map((show) => show.numberOfSeasons).filter(isTruthy);
    const max = seasons.length > 0 ? Math.max(...seasons) : 10;

    return [1, Math.max(max, 2)] as const;
});

function renderPerson(key: string): string {
    return personNames.value.get(key) ?? key;
}

function renderStatus(status: (typeof statusOptions)[number]): string {
    if (status === 'all') {
        return translate('shows.advancedFilters.allStatuses');
    }

    return translate(`shows.statuses.${status}`);
}

function submit() {
    close({
        filters: {
            watchingStatus: form.watchingStatus === 'all' ? null : form.watchingStatus,
            genres: form.genres.length > 0 ? form.genres : null,
            creators: form.creators.length > 0 ? form.creators : null,
            cast: form.cast.length > 0 ? form.cast : null,
            countries: form.countries.length > 0 ? form.countries : null,
            languages: form.languages.length > 0 ? form.languages : null,
            releaseYear: form.releaseYear[0] === null && form.releaseYear[1] === null ? null : form.releaseYear,
            seasons: form.seasons[0] === null && form.seasons[1] === null ? null : form.seasons,
            rating: form.rating[0] === null && form.rating[1] === null ? null : form.rating,
        },
    });
}

onMounted(async () => {
    if (creditsReady.value) {
        return;
    }

    try {
        await Promise.all(initialShowsWithoutCredits.map((show) => show.credits.updateValue()));
    } finally {
        creditsReady.value = true;
    }
});
</script>
