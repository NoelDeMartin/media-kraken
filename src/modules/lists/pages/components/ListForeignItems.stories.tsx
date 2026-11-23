import { useSeededModels } from '@aerogel/storybook';
import { isInstanceOf } from '@noeldemartin/utils';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { defineComponent } from 'vue';

import { useResolvedListItems } from '@lists/lib/composition/items';
import { attachStubItem, documents } from '@lists/lib/stubs/lists';
import List from '@lists/models/List';
import Movie from '@movies/models/Movie';
import Show from '@shows/models/Show';

import ListForeignItems from './ListForeignItems.vue';

type Story = StoryObj<typeof meta>;

type StoryArgs = {
    mediaUrls: string[];
    missingMediaUrls?: string[];
    loading?: boolean;
};

const ResolvedListForeignItems = defineComponent(
    (props: { list: List; loading?: boolean }) => {
        const { items, loading } = useResolvedListItems(() => props.list, { foreign: true });

        return () => <ListForeignItems items={items.value} loading={props.loading || loading.value} />;
    },
    { props: ['list', 'loading'] },
);

const meta: Meta<StoryArgs> = {
    title: 'Organisms/ListForeignItems',
    component: ListForeignItems,
    args: {
        mediaUrls: [
            'local://movies/the-substance-2024#it',
            'local://shows/severance-2022/index#it',
            'local://movies/the-tale-of-the-princess-kaguya-2013#it',
            'local://shows/pluribus-2025/index#it',
            'local://movies/all-that-jazz-1979#it',
            'local://shows/freaks-and-geeks-1999/index#it',
            'local://shows/succession-2018/index#it',
        ],
    },
    render: (args) => ({
        setup() {
            const lists = useSeededModels(List, {
                documents,
                setup: async () => {
                    const missing = new Map<string, Movie | Show>();

                    for (const url of args.missingMediaUrls ?? []) {
                        const media = (await Movie.find(url)) ?? (await Show.find(url));

                        if (!media) {
                            continue;
                        }

                        missing.set(
                            url,
                            isInstanceOf(media, Movie)
                                ? new Movie({
                                      title: media.title,
                                      posterUrl: media.posterUrl,
                                      releaseDate: media.releaseDate,
                                      externalUrls: media.externalUrls,
                                  })
                                : new Show({
                                      name: media.name,
                                      posterUrl: media.posterUrl,
                                      startDate: media.startDate,
                                      externalUrls: media.externalUrls,
                                  }),
                        );

                        await media.delete();
                    }

                    const list = await List.create({ name: 'Favorites' });

                    for (const url of args.mediaUrls) {
                        attachStubItem(
                            list,
                            url,
                            missing.get(url) ?? (await Movie.find(url)) ?? (await Show.find(url)),
                        );
                    }

                    await list.save();
                },
            });

            return () => {
                const list = lists.value?.[0];

                return (
                    list && (
                        <div style={{ width: '100%', maxWidth: '64rem', margin: '0 auto', padding: '0 1.25rem' }}>
                            <ResolvedListForeignItems list={list} loading={args.loading} />
                        </div>
                    )
                );
            };
        },
    }),
};

export const Primary: Story = {};

export const EdgeCases: Story = {
    args: {
        mediaUrls: [
            'local://movies/missing-poster#it',
            'local://movies/invalid-poster#it',
            'local://movies/deleted-movie#it',
            'local://movies/the-testament-of-dr-mabuse-1933#it',
        ],
        missingMediaUrls: ['local://movies/the-testament-of-dr-mabuse-1933#it'],
    },
};

export const Loading: Story = {
    args: { loading: true },
};

export const Empty: Story = {
    args: { mediaUrls: [] },
};

export default meta;
