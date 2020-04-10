import MediaKrakenError from './MediaKrakenError';

export default class MediaValidationError extends MediaKrakenError {

    public reasons: string[];

    constructor(reasons: string[]) {
        super('Media validation failed');

        this.reasons = reasons;
    }

}
