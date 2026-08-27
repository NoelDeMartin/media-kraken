import { arraySorted, compare } from '@noeldemartin/utils';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { computed } from 'vue';

import movies from '@/lib/stubs/solid-movies';
import shows from '@/lib/stubs/solid-shows';
import Movie from '@/models/Movie';
import type Show from '@/models/Show';

import MediaSearch from './MediaSearch.vue';

type Story = StoryObj<typeof meta>;

type StoryArgs = {
    loading: boolean;
    query: string;
};

const meta: Meta<StoryArgs> = {
    title: 'MediaSearch',
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
                ([] as Array<Movie | Show>)
                    .concat(movies.all.filter((movie) => movie.title.toLowerCase().includes(args.query.toLowerCase())))
                    .concat(shows.all.filter((show) => show.name.toLowerCase().includes(args.query.toLowerCase()))),
                (a, b) => compare(a instanceof Movie ? a.title : a.name, b instanceof Movie ? b.title : b.name),
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
