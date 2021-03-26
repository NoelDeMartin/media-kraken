import MediaKrakenError from './MediaKrakenError';

function errorMessage(forbidden: boolean, url: string): string {
    const typeInfo = forbidden ? ' (Forbidden)' : '';

    return `Unauthorized${typeInfo}: ${url}`;
}

export default class UnauthorizedError extends MediaKrakenError {

    public readonly forbidden: boolean;
    public readonly url: string;

    constructor(forbidden: boolean, url: string) {
        super(errorMessage(forbidden, url));

        this.forbidden = forbidden;
        this.url = url;
    }

}
