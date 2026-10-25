import { Errors, translate, UI } from '@aerogel/core';
import { routeUrl } from '@aerogel/plugin-routing';
import { after, arrayChunk } from '@noeldemartin/utils';

import type { Media } from '@/lib/media';
import Catalog from '@/services/Catalog';

import ProcessingJob from './ProcessingJob';

const CHUNK_SIZE = 10;

export default class SynchronizeMedia extends ProcessingJob<Media, void> {
    constructor(media: Media[]) {
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
                        Errors.report(
                            new Error(`Failed to synchronize media (${routeUrl(item.route)})`, { cause: error }),
                        ),
                    );
                    await this.markItemCompleted(index * CHUNK_SIZE + itemIndex);
                }),
            );
        }
    }
}
