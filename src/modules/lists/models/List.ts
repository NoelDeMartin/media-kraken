import { arraySorted } from '@noeldemartin/utils';
import { isLocalUrl } from 'soukai-bis';
import type { BelongsToManyRelation, ModelWithUrl } from 'soukai-bis';
import type { RouteLocationRaw } from 'vue-router';

import { mediaDisplayName, type Media } from '@/lib/media';

import Model from './List.schema';
import type ListItem from './ListItem';

// Media documents are private, so list items keep the details needed to display them without reading those documents.
function itemDetails(media: Media): Pick<ListItem, 'name' | 'imageUrl' | 'externalUrls'> {
    return { name: mediaDisplayName(media), imageUrl: media.posterUrl, externalUrls: media.externalUrls };
}

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

    public get mediaUrls(): string[] {
        return this.sortedItems.map((item) => item.mediaUrl);
    }

    public get route(): RouteLocationRaw {
        return {
            name: 'lists.show',
            params: { list: this.slug },
            query: this.url && !isLocalUrl(this.url) ? { url: this.url } : undefined,
        };
    }

    public has(media: Media): boolean {
        return !!this.items?.some((item) => item.mediaUrl === media.url);
    }

    public async add(media: ModelWithUrl<Media>): Promise<void> {
        if (this.has(media)) {
            return;
        }

        const lastPosition = this.sortedItems.at(-1)?.position ?? 0;

        await this.relatedItems.create({ mediaUrl: media.url, position: lastPosition + 1, ...itemDetails(media) });
    }

    public async updateItemDetails(media: Media[]): Promise<void> {
        for (const item of this.items ?? []) {
            const itemMedia = media.find(({ url }) => url === item.mediaUrl);

            itemMedia && item.setAttributes(itemDetails(itemMedia));
        }

        if (!this.isDirty()) {
            return;
        }

        await this.save();
    }

    public async move(item: ListItem, target: ListItem): Promise<void> {
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

    public async replace(original: Media, replacement: ModelWithUrl<Media>): Promise<void> {
        if (this.has(replacement)) {
            await this.remove(original);

            return;
        }

        for (const item of this.items ?? []) {
            if (item.mediaUrl !== original.url) {
                continue;
            }

            item.setAttributes({ mediaUrl: replacement.url, ...itemDetails(replacement) });
        }

        await this.save();
    }

    public async remove(media: Media): Promise<void> {
        await this.removeItems(this.items?.filter((item) => item.mediaUrl === media.url) ?? []);
    }

    public async removeItem(item: ListItem): Promise<void> {
        await this.removeItems([item]);
    }

    protected async removeItems(items: ListItem[]): Promise<void> {
        if (items.length === 0) {
            return;
        }

        this.relatedItems.detach(items, { delete: true });

        await this.save();
    }
}
