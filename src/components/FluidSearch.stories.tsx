import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';

import FluidSearch from './FluidSearch.vue';

type Story = StoryObj<typeof meta>;

type StoryArgs = {
    query: string | null;
};

const meta: Meta<StoryArgs> = {
    title: 'Atoms/FluidSearch',
    component: FluidSearch,
    args: { query: null },
    render: (args) => {
        const query = ref(args.query);

        return () => (
            <div class="flex justify-end">
                <FluidSearch
                    modelValue={query.value}
                    placeholder="Filter movies..."
                    onUpdate:modelValue={(value?: string | null) => (query.value = value ?? null)}
                />
            </div>
        );
    },
};

export const Collapsed: Story = {};

export const Searching: Story = { args: { query: 'samurai' } };

export default meta;
