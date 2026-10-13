import type { RangeSliderValue } from '@aerogel/core';
import { deepEquals, isNullable, type Nullable } from '@noeldemartin/utils';
import { ref, watch, type Ref } from 'vue';
import { useRoute, useRouter, type LocationQuery } from 'vue-router';

export type QueryFilterType = 'boolean' | 'string' | 'list' | 'range';
export type QueryFilterFields<T> = { [K in keyof T]-?: QueryFilterType };
export type IndexDisplay = 'grid' | 'table';

const QUICK_FILTER_PARAM = 'q';
const DISPLAY_PARAM = 'view';
const PAGE_PARAM = 'page';

function queryValue(query: LocationQuery, name: string): string | null {
    const value = query[name];
    const firstValue = Array.isArray(value) ? value[0] : value;

    return firstValue || null;
}

function parseRangeLimit(limit: string | undefined): number | null {
    const value = limit ? Number(limit) : NaN;

    return Number.isNaN(value) ? null : value;
}

function parsePage(value: string | null): number {
    const page = Number(value);

    return Number.isInteger(page) && page > 0 ? page : 1;
}

function parseFilter(type: QueryFilterType, value: string): unknown {
    switch (type) {
        case 'boolean':
            return value === 'true' ? true : value === 'false' ? false : null;
        case 'string':
            return value;
        case 'list':
            return value.split(',').filter(Boolean);
        case 'range': {
            const [min, max] = value.split('-');
            const range: RangeSliderValue = [parseRangeLimit(min), parseRangeLimit(max)];

            return range.some((limit) => limit !== null) ? range : null;
        }
    }
}

function serializeFilter(type: QueryFilterType, value: unknown): string | null {
    if (isNullable(value)) {
        return null;
    }

    switch (type) {
        case 'boolean':
        case 'string':
            return String(value);
        case 'list':
            return (value as string[]).join(',') || null;
        case 'range': {
            const [min, max] = value as RangeSliderValue;

            return isNullable(min) && isNullable(max) ? null : `${min ?? ''}-${max ?? ''}`;
        }
    }
}

// oxlint-disable-next-line typescript/explicit-module-boundary-types
export function useMediaFilters<T extends object>(fields: QueryFilterFields<T>) {
    const route = useRoute();
    const router = useRouter();
    const routeName = route.name;
    const quickFilter = ref<string | null>(null);
    const advancedFilters = ref(null) as Ref<Nullable<T>>;
    const display = ref<IndexDisplay>('grid');
    const page = ref(1);
    const fieldEntries = Object.entries(fields) as [keyof T & string, QueryFilterType][];

    function serializeQuery(): LocationQuery {
        const query: LocationQuery = {};

        if (display.value === 'table') {
            query[DISPLAY_PARAM] = display.value;

            if (page.value > 1) {
                query[PAGE_PARAM] = String(page.value);
            }
        }

        if (quickFilter.value) {
            query[QUICK_FILTER_PARAM] = quickFilter.value;
        }

        for (const [name, type] of fieldEntries) {
            const value = serializeFilter(type, advancedFilters.value?.[name]);

            if (value !== null) {
                query[name] = value;
            }
        }

        return query;
    }

    function parseQuery(query: LocationQuery): void {
        const filters: Partial<Record<keyof T, unknown>> = {};

        for (const [name, type] of fieldEntries) {
            const value = queryValue(query, name);
            const filter = value && parseFilter(type, value);

            if (!isNullable(filter)) {
                filters[name] = filter;
            }
        }

        display.value = queryValue(query, DISPLAY_PARAM) === 'table' ? 'table' : 'grid';
        page.value = display.value === 'table' ? parsePage(queryValue(query, PAGE_PARAM)) : 1;
        quickFilter.value = queryValue(query, QUICK_FILTER_PARAM);
        advancedFilters.value = Object.keys(filters).length > 0 ? (filters as T) : null;
    }

    function clear(): void {
        quickFilter.value = null;
        advancedFilters.value = null;
    }

    watch(
        () => route.query,
        (query) => {
            if (route.name !== routeName || deepEquals(query, serializeQuery())) {
                return;
            }

            parseQuery(query);
        },
        { immediate: true },
    );

    watch([quickFilter, advancedFilters, display, page], () => {
        const query = serializeQuery();

        if (route.name !== routeName || deepEquals(query, route.query)) {
            return;
        }

        void router.replace({ query });
    });

    return { quickFilter, advancedFilters, display, page, clear };
}
