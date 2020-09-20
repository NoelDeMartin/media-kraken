import MediaKrakenError from './MediaKrakenError';

export default class NetworkRequestError extends MediaKrakenError {

    public readonly url: string;

    constructor(url: string) {
        super(`Request failed trying to fetch ${url}`);

        this.url = url;
    }

}
