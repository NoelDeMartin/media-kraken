import { JSError } from '@noeldemartin/utils';

export default class MediaNotFoundError extends JSError {
    public constructor() {
        super('Not found');
    }
}
