import { arraySorted, isInstanceOf, uuid } from '@noeldemartin/utils';
import { isLocalUrl } from 'soukai-bis';
import type { BelongsToManyRelation, GetModelInput } from 'soukai-bis';
import type { RouteLocationRaw } from 'vue-router';

import type { Media } from '@/lib/media';
import Movie from '@movies/models/Movie';
import Show from '@shows/models/Show';

import Model from './List.schema';
import type ListItem from './ListItem';

export default class List extends Model {
    public static cloud = true;

    declare public readonly items?: ListItem[];
    declare public readonly relatedItems: BelongsToManyRelation<this, ListItem, typeof ListItem>;

    public get slug(): string {
        return this.requireSlug();
    }

    public get sortedItems(): ListItem[] {
        return arraySorted(this.items ?? [], 'position');
    }

    public get route(): RouteLocationRaw {
        return {
            name: 'lists.show',
            params: { list: this.slug },
            query: this.url && !isLocalUrl(this.url) ? { url: this.url } : undefined,
        };
    }

    public hasMedia(media: Media): boolean {
        return this.itemsFor(media).length > 0;
    }

    public attachMedia(media: Media): ListItem {
        const { itemMedia, attachToItem } = this.prepareListItemMedia(media);
        const lastPosition = this.sortedItems.at(-1)?.position ?? 0;
        const mediaUrl = itemMedia.mintUrl({ documentUrl: this.requireDocumentUrl(), resourceHash: uuid() });
        const item = this.relatedItems.attach({ mediaUrl, position: lastPosition + 1 }, { mintUrl: true });

        attachToItem(item);

        return item;
    }

    public async addMedia(media: Media): Promise<void> {
        if (this.hasMedia(media)) {
            return;
        }

        this.attachMedia(media);

        await this.save();
    }

    public async updateMedia(media: Media): Promise<void> {
        for (const item of this.itemsFor(media)) {
            const { attributes } = this.prepareListItemMediaAttributes(media);

            item.media?.setAttributes(attributes);
        }

        if (!this.isDirty()) {
            return;
        }

        await this.save();
    }

    public async replaceMedia(original: Media, replacement: Media): Promise<void> {
        const originalItems = this.itemsFor(original);

        if (this.itemsFor(replacement).some((item) => !originalItems.includes(item))) {
            await this.removeItems(originalItems);

            return;
        }

        for (const item of originalItems) {
            if (item.media && item.media.constructor === replacement.constructor) {
                const { attributes } = this.prepareListItemMediaAttributes(replacement);

                item.media.setAttributes(attributes);

                continue;
            }

            const previousMedia = item.media;
            const { itemMedia, attachToItem } = this.prepareListItemMedia(replacement);
            const mediaUrl = itemMedia.mintUrl({ documentUrl: this.requireDocumentUrl(), resourceHash: uuid() });

            item.setAttribute('mediaUrl', mediaUrl);

            attachToItem(item);

            await previousMedia?.delete();
        }

        await this.save();
    }

    public async removeMedia(media: Media): Promise<void> {
        await this.removeItems(this.itemsFor(media));
    }

    public async moveItem(item: ListItem, target: ListItem): Promise<void> {
        const items = this.sortedItems;
        const targetIndex = items.indexOf(target);

        if (item === target || !items.includes(item) || targetIndex === -1) {
            return;
        }

        items.splice(items.indexOf(item), 1);
        items.splice(targetIndex, 0, item);
        items.forEach((sortedItem, index) => sortedItem.setAttribute('position', index + 1));

        await this.save();
    }

    public async removeItems(items: ListItem[]): Promise<void> {
        if (items.length === 0) {
            return;
        }

        this.relatedItems.detach(items, { delete: true });

        await this.save();
    }

    private itemsFor(media: Media): ListItem[] {
        return this.items?.filter((item) => item.matches(media)) ?? [];
    }

    private prepareListItemMediaAttributes(
        media: Media,
    ):
        | { mediaType: 'movies'; attributes: GetModelInput<typeof Movie> }
        | { mediaType: 'shows'; attributes: GetModelInput<typeof Show> } {
        const attributes = {
            posterUrl: media.posterUrl,
            externalUrls: media.identityUrls,
        };

        if (isInstanceOf(media, Movie)) {
            return { mediaType: 'movies', attributes: { ...attributes, title: media.title } };
        }

        return { mediaType: 'shows', attributes: { ...attributes, name: media.name } };
    }

    private prepareListItemMedia(media: Media): { itemMedia: Media; attachToItem: (item: ListItem) => void } {
        const { mediaType, attributes } = this.prepareListItemMediaAttributes(media);

        if (mediaType === 'movies') {
            const itemMedia = new Movie(attributes);

            return {
                itemMedia,
                attachToItem: (item) => {
                    item.relatedShow.related = null;
                    item.relatedMovie.attach(itemMedia);
                },
            };
        }

        const itemMedia = new Show(attributes);

        return {
            itemMedia,
            attachToItem: (item) => {
                item.relatedMovie.related = null;
                item.relatedShow.attach(itemMedia);
            },
        };
    }
}
