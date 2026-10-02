import { Errors, translate, UI } from '@aerogel/core';
import { after, arrayChunk } from '@noeldemartin/utils';

import type Movie from '@/models/Movie';
import type Show from '@/models/Show';
import Catalog from '@/services/Catalog';

import ProcessingJob from './ProcessingJob';

const CHUNK_SIZE = 10;

export default class SynchronizeMedia extends ProcessingJob<Movie | Show, void> {
    constructor(media: Array<Movie | Show>) {
        super(media);
    }

    protected override async run(): Promise<void> {
        await Promise.all([this.synchronizeMedia(), after({ seconds: 3 })]);

        UI.toast(translate('media.synchronized'));
    }

    private async synchronizeMedia(): Promise<void> {
        const chunks = arrayChunk(this.items, CHUNK_SIZE);

        for (const [index, media] of chunks.entries()) {
            this.assertNotCancelled();

            await Promise.all(
                media.map(async (item, itemIndex) => {
                    await Catalog.syncIfNeeded(item).catch((error) =>
                        Errors.report(new Error(`Failed to synchronize media (${item.url})`, { cause: error })),
                    );
                    await this.markItemCompleted(index * CHUNK_SIZE + itemIndex);
                }),
            );
        }
    }
}
