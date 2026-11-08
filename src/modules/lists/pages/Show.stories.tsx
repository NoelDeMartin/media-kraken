import type { Meta, StoryObj } from '@storybook/vue3-vite';

import { sampleList, type SampleCollection } from '@/lib/storybook/collection';
import PageStory from '@/lib/storybook/PageStory.vue';

import ListsShow from './Show.vue';

type Story = StoryObj<typeof meta>;

const meta: Meta = {
    title: 'Pages/Lists/Show',
    component: ListsShow,
    tags: ['!autodocs'],
    parameters: { layout: 'fullscreen' },
};

export const Default: Story = {
    render: () => <PageStory route={(collection: SampleCollection) => sampleList(collection, 'Favorites').route} />,
};

export const Empty: Story = {
    render: () => (
        <PageStory route={(collection: SampleCollection) => sampleList(collection, 'Movie night with friends').route} />
    ),
};

export default meta;
