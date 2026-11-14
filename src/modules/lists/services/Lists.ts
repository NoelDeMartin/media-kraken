import { Service } from '@aerogel/core';
import { getTrackedModels, loadTrackedModels } from '@aerogel/plugin-solid';
import { facade } from '@noeldemartin/utils';
import type { ModelConstructor } from 'soukai-bis';

import { type Media } from '@/lib/media';
import Movie from '@/modules/movies/models/Movie';
import Show from '@/modules/shows/models/Show';
import List from '@lists/models/List';

export class ListsService extends Service {
    public async replaceInLists(original: Media, replacement: Media): Promise<void> {
        for (const list of await this.listsWith(original)) {
            await list.replaceMedia(original, replacement);
        }
    }

    protected override async boot(): Promise<void> {
        this.watchMediaModel(Movie);
        this.watchMediaModel(Show);
    }

    private watchMediaModel(mediaClass: ModelConstructor<Media>): void {
        mediaClass.on('updated', (media) => {
            if (!media.url?.startsWith(mediaClass.defaultContainerUrl)) {
                return;
            }

            return this.updateInLists(media);
        });

        mediaClass.on('deleted', (media) => {
            if (!media.url?.startsWith(mediaClass.defaultContainerUrl)) {
                return;
            }

            return this.removeFromLists(media);
        });
    }

    private async updateInLists(media: Media): Promise<void> {
        for (const list of await this.listsWith(media)) {
            await list.updateMedia(media);
        }
    }

    private async removeFromLists(media: Media): Promise<void> {
        if (!media.url) {
            return;
        }

        const url = media.url;

        for (const list of await this.listsWith(media)) {
            await list.removeItems(list.sortedItems.filter((item) => item.media?.externalUrls.includes(url)));
        }
    }

    private async listsWith(media: Media): Promise<List[]> {
        await loadTrackedModels(List);

        return getTrackedModels(List).filter((list) => list.hasMedia(media));
    }
}

export default facade(ListsService);
