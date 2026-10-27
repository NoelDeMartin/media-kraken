import { renderMarkdownAsText } from '@aerogel/core';
import type { RangeSliderValue } from '@aerogel/core';
import { isNullable, isTruthy, stringToSlug } from '@noeldemartin/utils';

import type { PersonCredit } from '@/models/Person';
import type Movie from '@movies/models/Movie';
import type Show from '@shows/models/Show';

const NOTES_PREVIEW_LENGTH = 300;

export type Media = Movie | Show;

export function matchesAny<T>(selected: T[], values: T[]): boolean {
    return values.some((value) => !isNullable(value) && selected.includes(value));
}

export function matchesRange(range: RangeSliderValue, value: number | null): boolean {
    const [min, max] = range;

    if (value === null) {
        return false;
    }

    return (isNullable(min) || value >= min) && (isNullable(max) || value <= max);
}

export function mediaDisplayName(media: Media): string {
    return 'title' in media ? media.title : media.name;
}

export function personFilterKey(person: PersonCredit): string | null {
    if (person.tmdbId) {
        return `tmdb-${person.tmdbId}`;
    }

    return stringToSlug(person.name) || null;
}

export function sortByLocale<T>(items: T[], render: (item: T) => string): T[] {
    return items.slice(0).sort((a, b) => render(a).localeCompare(render(b)));
}

export function toSearchText(text: string): string {
    return stringToSlug(text).replaceAll('-', '');
}

export function uniquePersonKeys(people: PersonCredit[]): string[] {
    return Array.from(new Set(people.map(personFilterKey).filter(isTruthy)));
}

export function notesPreview(notes: string): string {
    const text = renderMarkdownAsText(notes);
    const characters = Array.from(text);

    return characters.length > NOTES_PREVIEW_LENGTH
        ? `${characters.slice(0, NOTES_PREVIEW_LENGTH).join('').trimEnd()}…`
        : text;
}
