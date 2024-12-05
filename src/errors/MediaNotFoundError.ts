import MediaKrakenError from './MediaKrakenError';

export default class MediaNotFoundError extends MediaKrakenError {

    constructor(message?: string) {
        super(message ?? 'This media could not be found');
    }

}
