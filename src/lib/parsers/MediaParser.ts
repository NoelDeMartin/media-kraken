import type { Nullable } from '@noeldemartin/utils';

export interface ExternalMedia {
    name?: string;
    type?: 'show' | 'movie';
    imdbId?: string;
    watchedAt?: Nullable<Date>;
    validationError?: string;
    skippedMessage?: string;
    raw: any;
}

export default abstract class MediaParser {
    abstract parse(data: unknown): Promise<ExternalMedia[]>;
}
