export class MediaValidationError extends Error {
    public readonly reasons: string[];

    constructor(reasons: string[]) {
        super(reasons.join(', '));
        this.reasons = reasons;
    }
}

export class UnsuitableMediaError extends MediaValidationError {
    public readonly reason: string;

    constructor(reason: string) {
        super([reason]);
        this.reason = reason;
    }
}

export class MediaNotFoundError extends Error {}
