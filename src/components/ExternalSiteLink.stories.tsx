import type { Meta, StoryObj } from '@storybook/vue3-vite';

import ExternalSiteLink from './ExternalSiteLink.vue';

type Story = StoryObj<typeof meta>;

const meta = {
    title: 'Atoms/ExternalSiteLink',
    component: ExternalSiteLink,
    args: { url: 'https://www.themoviedb.org/movie/933260' },
} satisfies Meta<typeof ExternalSiteLink>;

export const TMDB: Story = {};

export const IMDb: Story = { args: { url: 'https://www.imdb.com/title/tt17526714' } };

export const Other: Story = { args: { url: 'https://www.wikidata.org/wiki/Q113380226' } };

export default meta;
