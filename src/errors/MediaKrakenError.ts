export default class MediaKrakenError extends Error {

    constructor(message?: string) {
        super(message);

        // Fix inheritance: https://stackoverflow.com/questions/41102060/typescript-extending-error-class
        this.name = new.target.name;
        Object.setPrototypeOf(this, new.target.prototype);
    }

}
