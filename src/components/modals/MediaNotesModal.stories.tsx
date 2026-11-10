import { ModalStory } from '@aerogel/storybook';
import type { Meta, StoryObj } from '@storybook/vue3-vite';

import { sampleMovie, useSampleCollection } from '@/lib/storybook/collection';

import MediaNotesModal from './MediaNotesModal.vue';

type Story = StoryObj<typeof meta>;

type StoryArgs = {
    movie: string;
};

const meta: Meta<StoryArgs> = {
    title: 'Modals/MediaNotesModal',
    component: MediaNotesModal,
    tags: ['!autodocs'],
    parameters: { layout: 'fullscreen' },
    args: { movie: 'All That Jazz' },
    render: (args) => ({
        setup() {
            const collection = useSampleCollection();

            return () =>
                collection.value && (
                    <ModalStory
                        component={MediaNotesModal}
                        props={{ media: sampleMovie(collection.value, args.movie) }}
                    />
                );
        },
    }),
};

export const Add: Story = {};

export const Edit: Story = { args: { movie: 'The Substance' } };

export default meta;
