import { ModalStory, useSeededModels } from '@aerogel/storybook';
import type { Meta, StoryObj } from '@storybook/vue3-vite';

import { documents, seedLists } from '@lists/lib/stubs/lists';
import List from '@lists/models/List';

import ListFormModal from './ListFormModal.vue';

type Story = StoryObj<typeof meta>;

type StoryArgs = {
    edit: boolean;
};

const meta: Meta<StoryArgs> = {
    title: 'modules/lists/ListFormModal',
    component: ListFormModal,
    parameters: { layout: 'fullscreen' },
    args: {
        edit: false,
    },
    render: (args) => ({
        setup() {
            const lists = useSeededModels(List, {
                documents,
                setup: () => seedLists([{ name: 'Halloween marathon', mediaUrls: [] }]),
            });

            return () => {
                const list = lists.value?.[0];

                if (args.edit && !list) {
                    return null;
                }

                return <ModalStory component={ListFormModal} props={args.edit ? { list } : {}} />;
            };
        },
    }),
};

export const Create: Story = {};

export const Edit: Story = {
    args: { edit: true },
};

export default meta;
