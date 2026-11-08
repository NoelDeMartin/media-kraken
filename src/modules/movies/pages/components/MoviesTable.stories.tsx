import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';

import { useSampleCollection } from '@/lib/storybook/collection';

import MoviesTable from './MoviesTable.vue';

type Story = StoryObj<typeof meta>;

type StoryArgs = {
    loading: boolean;
    empty: boolean;
};

const meta: Meta<StoryArgs> = {
    title: 'Organisms/MoviesTable',
    component: MoviesTable,
    args: { loading: false, empty: false },
    render: (args) => ({
        setup() {
            const collection = useSampleCollection();
            const page = ref(1);

            return () =>
                collection.value && (
                    <MoviesTable
                        movies={args.empty ? [] : collection.value.movies}
                        loading={args.loading}
                        page={page.value}
                        onUpdate:page={(value: number) => (page.value = value)}
                    >
                        {{ empty: () => <p class="py-8 text-center text-gray-600">No results</p> }}
                    </MoviesTable>
                );
        },
    }),
};

export const Default: Story = {};

export const Loading: Story = { args: { loading: true } };

export const Empty: Story = { args: { empty: true } };

export default meta;
