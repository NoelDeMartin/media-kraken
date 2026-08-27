import { Button, UI } from '@aerogel/core';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { onMounted } from 'vue';

import tmdbShows from '@/lib/stubs/tmdb-shows';

import ShowPreviewModal from './ShowPreviewModal.vue';

type Story = StoryObj<typeof meta>;

type StoryArgs = {
    show: string;
};

const meta: Meta<StoryArgs> = {
    title: 'ShowPreviewModal',
    component: ShowPreviewModal,
    argTypes: {
        show: tmdbShows.control,
    },
    args: {
        show: tmdbShows.first,
    },
    render(args) {
        const show = tmdbShows.resolve(args.show);

        async function open() {
            await UI.modal(ShowPreviewModal, { show });
        }

        onMounted(() => open());

        return (
            <div style={{ display: 'flex', justifyContent: 'start' }}>
                <Button onClick={open}>Open</Button>
            </div>
        );
    },
};

export const Primary: Story = {};

export default meta;
