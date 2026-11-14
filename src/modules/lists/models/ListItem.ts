import { type Media } from '@/lib/media';

import Model from './ListItem.schema';

export default class ListItem extends Model {
    public get media(): Media | undefined {
        return this.movie ?? this.show;
    }

    public matches(media: Media): boolean {
        const identityUrls = media.identityUrls;

        return !!this.media?.externalUrls.some((url) => identityUrls.includes(url));
    }
}
