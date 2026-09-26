<template>
    <Modal :title="$t('movies.advancedFilters.title')">
        <Form :form @submit="submit">
            <div class="space-y-4">
                <Combobox
                    name="genres"
                    :label="$t('movies.advancedFilters.genre')"
                    :placeholder="$t('movies.advancedFilters.allGenres')"
                    :options="genreOptions"
                    :render-option="renderGenre"
                />

                <Select
                    name="watchStatus"
                    :label="$t('movies.advancedFilters.watchStatus')"
                    :options="statusOptions"
                    :render-option="renderStatus"
                />

                <Combobox
                    name="directors"
                    :label="$t('movies.advancedFilters.director')"
                    :placeholder="$t('movies.advancedFilters.allDirectors')"
                    :options="directorOptions"
                />

                <Combobox
                    name="cast"
                    :label="$t('movies.advancedFilters.cast')"
                    :placeholder="$t('movies.advancedFilters.allCast')"
                    :options="castOptions"
                />

                <Combobox
                    name="countries"
                    :label="$t('movies.advancedFilters.country')"
                    :placeholder="$t('movies.advancedFilters.allCountries')"
                    :options="countryOptions"
                    :render-option="formatCountry"
                />

                <Combobox
                    name="languages"
                    :label="$t('movies.advancedFilters.language')"
                    :placeholder="$t('movies.advancedFilters.allLanguages')"
                    :options="languageOptions"
                    :render-option="formatLanguage"
                />

                <RangeSlider
                    name="releaseYear"
                    :label="$t('movies.advancedFilters.releaseYear')"
                    :min="yearBounds[0]"
                    :max="yearBounds[1]"
                />

                <RangeSlider
                    name="duration"
                    :label="$t('movies.advancedFilters.duration')"
                    :min="durationBounds[0]"
                    :max="durationBounds[1]"
                    :step="DURATION_STEP"
                    :format-value="(minutes) => formatDuration({ minutes })"
                />
            </div>

            <div class="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-4">
                <Button
                    type="button"
                    variant="ghost"
                    size="small"
                    class="clickable text-gray-500 hover:text-gray-700"
                    @click="form.reset()"
                >
                    {{ $t('movies.advancedFilters.clear') }}
                </Button>
                <div class="flex items-center gap-2">
                    <Button type="button" variant="secondary" class="clickable" @click="close()">
                        {{ $t('ui.cancel') }}
                    </Button>
                    <Button submit class="clickable">
                        {{ $t('movies.advancedFilters.apply') }}
                    </Button>
                </div>
            </div>
        </Form>
    </Modal>
</template>

<script setup lang="ts">
import { Lang, translate, useForm, useModal } from '@aerogel/core';
import { isTruthy } from '@noeldemartin/utils';
import { computed } from 'vue';
import { z } from 'zod';

import { formatCountry, formatDuration, formatLanguage } from '@/lib/formatting';
import type { MovieWatchStatus, MoviesFilter } from '@/lib/movies';
import type Movie from '@/models/Movie';
import TMDB from '@/services/TMDB';

const DURATION_STEP = 5;

const { filters, movies = [] } = defineProps<{
    filters?: MoviesFilter | null;
    movies?: Movie[];
}>();

defineEmits<{ close: [filter?: MoviesFilter] }>();

const { close } = useModal<MoviesFilter>();
const statusOptions: MovieWatchStatus[] = ['all', 'watched', 'unwatched'];
const range = z.tuple([z.number().nullable(), z.number().nullable()]).default([null, null]);
const form = useForm({
    genres: z.array(z.number()).default([]),
    directors: z.array(z.string()).default([]),
    cast: z.array(z.string()).default([]),
    countries: z.array(z.string()).default([]),
    languages: z.array(z.string()).default([]),
    watchStatus: z.enum(statusOptions).default('all'),
    releaseYear: range,
    duration: range,
});

form.genres = filters?.genres ?? [];
form.directors = filters?.directors ?? [];
form.cast = filters?.cast ?? [];
form.countries = filters?.countries ?? [];
form.languages = filters?.languages ?? [];
form.watchStatus = filters?.watchStatus ?? 'all';
form.releaseYear = filters?.releaseYear ?? [null, null];
form.duration = filters?.duration ?? [null, null];

const genreOptions = computed(() => {
    const movieGenreIds = new Set(movies.flatMap((movie) => movie.genreIds));

    return sortBy(Array.from(movieGenreIds), renderGenre);
});
const directorOptions = computed(() =>
    sortBy(uniqueNames(movies.flatMap((movie) => movie.directors ?? [])), (name) => name),
);
const castOptions = computed(() => sortBy(uniqueNames(movies.flatMap((movie) => movie.actors ?? [])), (name) => name));
const countryOptions = computed(() =>
    sortBy(Array.from(new Set(movies.flatMap((movie) => movie.countryCodes))), formatCountry),
);
const languageOptions = computed(() =>
    sortBy(Array.from(new Set(movies.flatMap((movie) => movie.languages))), formatLanguage),
);
const yearBounds = computed(() => {
    const years = movies.map((movie) => movie.releaseYear).filter(isTruthy);
    const currentYear = new Date().getFullYear();
    const min = years.length > 0 ? Math.min(...years) : 1900;
    const max = years.length > 0 ? Math.max(...years) : currentYear;

    return [min, Math.max(max, min + 1)] as const;
});
const durationBounds = computed(() => {
    const durations = movies.map((movie) => movie.runtimeMinutes).filter(isTruthy);
    const max = durations.length > 0 ? Math.max(...durations) : 300;

    return [0, Math.max(Math.ceil(max / DURATION_STEP) * DURATION_STEP, DURATION_STEP)] as const;
});

function uniqueNames(people: { name?: string | null }[]): string[] {
    return Array.from(new Set(people.map((person) => person.name).filter(isTruthy)));
}

function sortBy<T>(items: T[], render: (item: T) => string): T[] {
    return items.sort((a, b) => render(a).localeCompare(render(b)));
}

function renderGenre(genre: number): string {
    return (Lang.locale && TMDB.genreTranslations[Lang.locale]?.[genre]) || String(genre);
}

function renderStatus(status: MovieWatchStatus): string {
    if (status === 'watched') {
        return translate('movies.watched');
    }

    if (status === 'unwatched') {
        return translate('movies.watchLater');
    }

    return translate('movies.advancedFilters.allStatuses');
}

function submit() {
    close({
        genres: form.genres,
        directors: form.directors,
        cast: form.cast,
        countries: form.countries,
        languages: form.languages,
        watchStatus: form.watchStatus,
        releaseYear: form.releaseYear,
        duration: form.duration,
    });
}
</script>
