import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { screen, userEvent } from 'storybook/test';

import { sampleMovie, type SampleCollection } from '@/lib/storybook/collection';
import PageStory from '@/lib/storybook/PageStory.vue';
import Movie from '@movies/models/Movie';

import MoviesShow from './Show.vue';

type Story = StoryObj<typeof meta>;

const meta: Meta = {
    title: 'Pages/Movies/Show',
    component: MoviesShow,
    tags: ['!autodocs'],
    parameters: { layout: 'fullscreen' },
};

function movieRoute(title: string) {
    return (collection: SampleCollection) => sampleMovie(collection, title).route;
}

async function openActionsMenu(): Promise<void> {
    await userEvent.click(await screen.findByRole('button', { name: 'Open actions menu' }, { timeout: 10000 }));
}

export const Watched: Story = {
    render: () => <PageStory route={movieRoute('The Substance')} />,
};

export const Rewatched: Story = {
    render: () => <PageStory route={movieRoute('The Tale of The Princess Kaguya')} />,
};

export const RewatchedActions: Story = {
    ...Rewatched,
    play: openActionsMenu,
};

export const ResetWatchHistoryConfirmation: Story = {
    ...Rewatched,
    async play() {
        await openActionsMenu();
        await userEvent.click(await screen.findByRole('menuitem', { name: 'Mark as dropped' }));
    },
};

export const Pending: Story = {
    render: () => <PageStory route={movieRoute('All That Jazz')} />,
};

export const Dropped: Story = {
    render: () => <PageStory route={movieRoute('The Testament of Dr. Mabuse')} />,
};

export const WithoutMetadata: Story = {
    render: () => (
        <PageStory route={async () => (await Movie.create({ title: "Grandma's home videos" })).route} empty />
    ),
};

export const NotFound: Story = {
    render: () => <PageStory route={{ name: 'movies.show', params: { movie: 'not-found' } }} empty />,
};

export default meta;
