import MediaKrakenError from './MediaKrakenError';

export default class UnauthorizedError extends MediaKrakenError {

    constructor() {
        super('Unauthorized');
    }

}
