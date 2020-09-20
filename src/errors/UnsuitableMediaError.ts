import MediaValidationError from './MediaValidationError';

export default class UnsuitableMediaError extends MediaValidationError {

    public readonly reason: string;

    constructor(reason: string) {
        super([reason]);

        this.reason = reason;
    }

}
