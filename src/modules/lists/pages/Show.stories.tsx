import { SolidFake } from '@aerogel/plugin-solid';
import { isInstanceOf } from '@noeldemartin/utils';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { remote } from 'soukai-bis';
import { mocked } from 'storybook/test';
import { computed } from 'vue';

import { sampleList, sampleMovie, sampleShow, type SampleCollection } from '@/lib/storybook/collection';
import PageStory from '@/lib/storybook/PageStory.vue';
import { useResolvedListItems } from '@lists/lib/composition/items';
import List from '@lists/models/List';
import Movie from '@movies/models/Movie';
import Show from '@shows/models/Show';

import ListsShow from './Show.vue';

type Story = StoryObj<typeof meta>;

const meta: Meta = {
    title: 'Pages/ListsShow',
    component: ListsShow,
    tags: ['!autodocs'],
    parameters: { layout: 'fullscreen' },
};

function copyMediaWithExternalUrls(media: Movie | Show): Movie | Show {
    const attributes = { posterUrl: media.posterUrl, externalUrls: media.externalUrls };

    return isInstanceOf(media, Movie)
        ? new Movie({ ...attributes, title: media.title, releaseDate: media.releaseDate })
        : new Show({ ...attributes, name: (media as Show).name, startDate: (media as Show).startDate });
}

async function seedForeignList(collection: SampleCollection, options: { withOwner?: boolean } = {}) {
    const { withOwner = true } = options;
    const owner = withOwner ? SolidFake.fakeProfile() : null;

    if (owner) {
        SolidFake.setState({ profiles: { ...SolidFake.profiles, [owner.webId]: owner } });
    }

    const list = await remote(List).create({
        url: 'https://alice-cooper.example/lists/weekend-binge#it',
        owner: owner?.webId,
        name: 'Weekend binge',
        description: 'Things to watch when it rains all weekend.',
    });

    list.attachMedia(copyMediaWithExternalUrls(sampleShow(collection, 'Twin Peaks')));
    list.attachMedia(copyMediaWithExternalUrls(sampleMovie(collection, 'Seven Samurai')));
    list.attachMedia(copyMediaWithExternalUrls(sampleShow(collection, 'Severance')));
    list.attachMedia(copyMediaWithExternalUrls(sampleMovie(collection, 'Come and See')));

    await list.save();

    await sampleShow(collection, 'Twin Peaks').delete();
    await sampleMovie(collection, 'Come and See').delete();

    return list;
}

export const Default: Story = {
    render: () => <PageStory route={(collection: SampleCollection) => sampleList(collection, 'Favorites').route} />,
};

export const Empty: Story = {
    render: () => (
        <PageStory route={(collection: SampleCollection) => sampleList(collection, 'Movie night with friends').route} />
    ),
};

export const Foreign: Story = {
    render: () => (
        <PageStory route={async (collection: SampleCollection) => (await seedForeignList(collection)).route} />
    ),
};

export const ForeignLoading: Story = {
    name: 'Foreign (Loading)',
    beforeEach: () => {
        mocked(useResolvedListItems).mockImplementation((list) => ({
            loading: computed(() => true),
            items: computed(() => list().sortedItems.map((item) => ({ model: item, media: item.media }))),
        }));
    },
    render: () => (
        <PageStory route={async (collection: SampleCollection) => (await seedForeignList(collection)).route} />
    ),
};

export const ForeignUnknown: Story = {
    name: 'Foreign (Unknown)',
    render: () => (
        <PageStory
            route={async (collection: SampleCollection) =>
                (await seedForeignList(collection, { withOwner: false })).route
            }
        />
    ),
};

export const Sharing: Story = {
    render: () => (
        <PageStory route={async (collection: SampleCollection) => (await seedForeignList(collection)).shareRoute} />
    ),
};

export const SharingNotFound: Story = {
    render: () => (
        <PageStory
            route={{
                name: 'lists.show',
                params: { list: 'missing' },
                query: { url: 'https://alice-cooper.example/lists/missing#it', sharing: 'true' },
            }}
            empty
        />
    ),
};

export default meta;
