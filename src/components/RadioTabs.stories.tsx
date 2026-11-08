import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';

import RadioTabs from './RadioTabs.vue';

type Story = StoryObj<typeof meta>;

const meta: Meta = {
    title: 'Atoms/RadioTabs',
    render: () => {
        const value = ref('all');
        const options = [
            { value: 'all', label: 'All (16)' },
            { value: 'movies', label: 'Movies (11)' },
            { value: 'shows', label: 'Shows (5)' },
        ];

        return () => (
            <RadioTabs
                modelValue={value.value}
                options={options}
                onUpdate:modelValue={(newValue: string) => (value.value = newValue)}
            />
        );
    },
};

export const Default: Story = {};

export default meta;
