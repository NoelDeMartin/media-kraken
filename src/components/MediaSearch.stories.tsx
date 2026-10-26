import { arraySorted, compare } from '@noeldemartin/utils';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { computed } from 'vue';

import { mediaDisplayName, type Media } from '@/lib/media';
import movies from '@movies/lib/stubs/solid-movies';
import shows from '@shows/lib/stubs/solid-shows';

import MediaSearch from './MediaSearch.vue';

type Story = StoryObj<typeof meta>;

type StoryArgs = {
    loading: boolean;
    query: string;
};

const meta: Meta<StoryArgs> = {
    title: 'Core/MediaSearch',
    component: MediaSearch,
    argTypes: {
        loading: { control: 'boolean' },
        query: { control: 'text' },
    },
    args: {
        loading: false,
        query: '',
    },
    render(args) {
        const results = computed(() =>
            arraySorted(
                ([] as Media[])
                    .concat(movies.all.filter((movie) => movie.title.toLowerCase().includes(args.query.toLowerCase())))
                    .concat(shows.all.filter((show) => show.name.toLowerCase().includes(args.query.toLowerCase()))),
                (a, b) => compare(mediaDisplayName(a), mediaDisplayName(b)),
            ),
        );

        return (
            <div style={{ width: '90%', height: '600px', margin: '0 auto' }}>
                <MediaSearch open={true} loading={args.loading} results={results.value} query={args.query} />
            </div>
        );
    },
};

export const Primary: Story = {};

export const Loading: Story = { args: { loading: true } };

export const Empty: Story = { args: { query: 'not found' } };

export default meta;
