import { ModalStory } from '@aerogel/storybook';
import type { Meta, StoryObj } from '@storybook/vue3-vite';

import type { ImportMediaJobResult } from '@/jobs/ImportMedia';
import MediaNotFoundError from '@/lib/errors/MediaNotFoundError';
import movies from '@movies/lib/stubs/solid-movies';

import MediaImportResultModal from './MediaImportResultModal.vue';

type Story = StoryObj<typeof meta>;

const EMPTY_RESULT: ImportMediaJobResult = { added: [], ignored: [], invalid: [], failed: [], unprocessed: [] };
const RESULTS = {
    allOutcomes: {
        added: movies.all,
        ignored: [{ reason: 'The Matrix is already in your collection', data: { name: 'The Matrix' } }],
        invalid: [{ reason: 'Missing title', data: { date: '2024-01-01' } }],
        failed: [
            { notFound: true, error: new MediaNotFoundError(), data: { name: 'Unknown movie' } },
            { notFound: false, error: new Error('Network error'), data: { imdb: 'tt0000000' } },
        ],
        unprocessed: [{ name: 'Cancelled import', raw: {} }],
    },
    onlyAdded: { ...EMPTY_RESULT, added: movies.all },
} satisfies Record<string, ImportMediaJobResult>;

type StoryArgs = {
    result: keyof typeof RESULTS;
};

const meta: Meta<StoryArgs> = {
    title: 'Modals/MediaImportResultModal',
    component: MediaImportResultModal,
    tags: ['!autodocs'],
    parameters: { layout: 'fullscreen' },
    argTypes: {
        result: { control: { type: 'select' }, options: Object.keys(RESULTS) },
    },
    args: { result: 'allOutcomes' },
    render: (args) => <ModalStory component={MediaImportResultModal} props={{ result: RESULTS[args.result] }} />,
};

export const AllOutcomes: Story = {};

export const OnlyAdded: Story = { args: { result: 'onlyAdded' } };

export default meta;
