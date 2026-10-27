import { arraySorted, stringToSlug, urlRoute } from '@noeldemartin/utils';
import { isLocalUrl } from 'soukai-bis';
import type { BelongsToManyRelation, ModelWithUrl } from 'soukai-bis';
import type { RouteLocationRaw } from 'vue-router';

import type { Media } from '@/lib/media';

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

    public get mediaUrls(): string[] {
        return this.sortedItems.map((item) => item.mediaUrl);
    }

    public getSlug(): string | null {
        if (!this.url) {
            return (this.name && stringToSlug(this.name)) || null;
        }

        return urlRoute(this.url).split('/').pop() || null;
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

        await this.relatedItems.create({ mediaUrl: media.url, position: lastPosition + 1 });
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

            item.setAttribute('mediaUrl', replacement.url);
        }

        await this.save();
    }

    public async remove(media: Media): Promise<void> {
        await this.removeItems(this.items?.filter((item) => item.mediaUrl === media.url) ?? []);
    }

    public async removeItem(item: ListItem): Promise<void> {
        await this.removeItems([item]);
    }

    public async deleteWithItems(): Promise<void> {
        await this.loadRelationIfUnloaded('items');

        for (const item of this.items ?? []) {
            await item.delete();
        }

        await this.delete();
    }

    protected async removeItems(items: ListItem[]): Promise<void> {
        if (items.length === 0) {
            return;
        }

        this.relatedItems.detach(items, { delete: true });

        await this.save();
    }
}
