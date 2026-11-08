import type { Meta, StoryObj } from '@storybook/vue3-vite';

import { sampleShow, type SampleCollection } from '@/lib/storybook/collection';
import PageStory from '@/lib/storybook/PageStory.vue';

import ShowsShow from './Show.vue';

type Story = StoryObj<typeof meta>;

const meta: Meta = {
    title: 'Pages/Shows/Show',
    component: ShowsShow,
    tags: ['!autodocs'],
    parameters: { layout: 'fullscreen' },
};

export const Watching: Story = {
    render: () => <PageStory route={(collection: SampleCollection) => sampleShow(collection, 'Severance').route} />,
};

export const UpcomingEpisode: Story = {
    render: () => <PageStory route={(collection: SampleCollection) => sampleShow(collection, 'Pluribus').route} />,
};

export const Completed: Story = {
    render: () => (
        <PageStory route={(collection: SampleCollection) => sampleShow(collection, 'Freaks and Geeks').route} />
    ),
};

export const Pending: Story = {
    render: () => <PageStory route={(collection: SampleCollection) => sampleShow(collection, 'Twin Peaks').route} />,
};

export const Dropped: Story = {
    render: () => <PageStory route={(collection: SampleCollection) => sampleShow(collection, 'Succession').route} />,
};

export default meta;
