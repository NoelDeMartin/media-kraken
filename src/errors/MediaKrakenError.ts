export default class MediaKrakenError implements Error {

    public name: string;
    public message: string;
    public stack?: string;

    constructor(...args: any[]) {
        // Error cannot be extended and this is necessary
        // +info: https://stackoverflow.com/questions/12915412/how-do-i-extend-a-host-object-e-g-error-in-typescript
        const error = new Error(...args);
        this.name = error.name;
        this.message = error.message;
        this.stack = error.stack;
    }

}
