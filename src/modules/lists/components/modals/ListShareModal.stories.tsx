import { SolidFake } from '@aerogel/plugin-solid';
import { ModalStory, useSeededModels } from '@aerogel/storybook';
import { after } from '@noeldemartin/utils';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { mocked, userEvent, within } from 'storybook/test';

import { canShareList, fetchListVisibility, updateListVisibility } from '@lists/lib/sharing';
import type { ListVisibility } from '@lists/lib/sharing';
import { documents, seedLists } from '@lists/lib/stubs/lists';
import List from '@lists/models/List';

import ListShareModal from './ListShareModal.vue';

type Story = StoryObj<typeof meta>;

type StoryArgs = {
    state: ListVisibility | 'loading' | 'failed' | 'disconnected' | 'guest';
};

const meta: Meta<StoryArgs> = {
    title: 'Modals/ListShareModal',
    component: ListShareModal,
    tags: ['!autodocs'],
    parameters: { layout: 'fullscreen' },
    args: {
        state: 'private',
    },
    argTypes: {
        state: {
            control: 'select',
            options: ['private', 'unlisted', 'public', 'loading', 'failed', 'disconnected', 'guest'],
            description: 'Visibility read from the Solid POD, or what happens while reading it.',
        },
    },
    beforeEach: ({ args }) => {
        mocked(canShareList).mockReturnValue(args.state !== 'disconnected' && args.state !== 'guest');
        mocked(updateListVisibility).mockImplementation(() => after({ seconds: 1 }));
        mocked(fetchListVisibility).mockImplementation(async () => {
            switch (args.state) {
                case 'loading':
                case 'disconnected':
                case 'guest':
                    return new Promise(() => {});
                case 'failed':
                    throw new Error("Couldn't read the permissions of `https://alice.example/lists/favorites`.");
                default:
                    return args.state;
            }
        });
    },
    render: (args) => ({
        setup() {
            const profile = SolidFake.fakeProfile('Alice Cooper');

            SolidFake.setState({
                previousSession:
                    args.state === 'guest'
                        ? null
                        : { profile, loginUrl: profile.webId, authenticator: 'inrupt', error: null },
            });

            const lists = useSeededModels(List, {
                documents,
                setup: () => seedLists([{ name: 'Favorites', mediaUrls: [] }]),
            });

            return () => lists.value?.[0] && <ModalStory component={ListShareModal} props={{ list: lists.value[0] }} />;
        },
    }),
};

export const Private: Story = {};

export const Unlisted: Story = {
    args: { state: 'unlisted' },
};

export const Public: Story = {
    args: { state: 'public' },
};

export const Updating: Story = {
    beforeEach: () => {
        mocked(updateListVisibility).mockImplementation(() => new Promise(() => {}));
    },
    play: async ({ canvasElement }) => {
        await userEvent.click(await within(canvasElement).findByRole('radio', { name: /^Public/ }));
    },
};

export const Disconnected: Story = {
    args: { state: 'disconnected' },
};

export const Guest: Story = {
    args: { state: 'guest' },
};

export const Loading: Story = {
    args: { state: 'loading' },
};

export const ReadFailed: Story = {
    args: { state: 'failed' },
};

export const UpdateFailed: Story = {
    beforeEach: () => {
        mocked(updateListVisibility).mockImplementation(async () => {
            await after({ seconds: 1 });

            throw new Error("Couldn't update the permissions of `https://alice.example/lists/favorites`.");
        });
    },
    play: async ({ canvasElement }) => {
        await userEvent.click(await within(canvasElement).findByRole('radio', { name: /^Public/ }));
    },
};

export default meta;
