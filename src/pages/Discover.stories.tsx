import { SolidFake } from '@aerogel/plugin-solid';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import type { ModelWithUrl } from 'soukai-bis';
import { mocked } from 'storybook/test';

import PageStory from '@/lib/storybook/PageStory.vue';
import { fetchFriends, fetchPublicLists } from '@lists/lib/discovery';
import lists from '@lists/lib/stubs/solid-lists';
import type List from '@lists/models/List';

import Discover from './Discover.vue';

type Story = StoryObj<typeof meta>;

type StoryArgs = {
    state: 'lists' | 'loading' | 'noLists' | 'noFriends' | 'guest' | 'disconnected';
};

const meta: Meta<StoryArgs> = {
    title: 'Pages/Discover',
    component: Discover,
    tags: ['!autodocs'],
    parameters: { layout: 'fullscreen' },
    args: {
        state: 'lists',
    },
    argTypes: {
        state: {
            control: 'select',
            options: ['lists', 'loading', 'noLists', 'noFriends', 'guest', 'disconnected'],
        },
    },
    beforeEach: ({ args }) => {
        const alice = SolidFake.fakeProfile();
        const friends = [SolidFake.fakeProfile('Bob Marley'), SolidFake.fakeProfile('Charlie Parker')];

        SolidFake.setState({
            session: ['guest', 'disconnected'].includes(args.state) ? null : SolidFake.fakeSession(alice),
            previousSession:
                args.state === 'guest'
                    ? null
                    : { profile: alice, loginUrl: alice.webId, authenticator: 'inrupt', error: null },
        });

        mocked(fetchFriends).mockImplementation(async () => {
            switch (args.state) {
                case 'loading':
                    return new Promise(() => {});
                case 'noFriends':
                    return [];
                default:
                    return friends;
            }
        });
        mocked(fetchPublicLists).mockImplementation(async (friend) => {
            if (args.state === 'noLists') {
                return [];
            }

            const friendLists = friend === friends[0] ? lists.all.slice(0, 3) : lists.all.slice(3);

            return friendLists as ModelWithUrl<List>[];
        });
    },
    render: () => <PageStory route={{ name: 'discover' }} empty />,
};

export const Default: Story = {};

export const Loading: Story = {
    args: { state: 'loading' },
};

export const NoLists: Story = {
    args: { state: 'noLists' },
};

export const NoFriends: Story = {
    args: { state: 'noFriends' },
};

export const Guest: Story = {
    args: { state: 'guest' },
};

export const Disconnected: Story = {
    args: { state: 'disconnected' },
};

export default meta;
