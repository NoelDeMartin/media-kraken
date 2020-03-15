import { Attributes } from 'soukai';
import { Dayjs } from 'dayjs';

import Movie from '@/models/soukai/Movie';
import MediaContainer from '@/models/soukai/MediaContainer';

import ThirdPartyMedia from '@/models/third-party/ThirdPartyMedia';

interface OptionalProperties {
    description?: string;
    url?: string;
    releaseDate?: Dayjs;
    posterUrl?: string;
}

export default abstract class ThirdPartyMovie extends ThirdPartyMedia {

    public title: string;
    public description?: string;
    public url?: string;
    public releaseDate?: Dayjs;
    public posterUrl?: string;

    constructor(data: any, title: string, optionalProperties: OptionalProperties = {}) {
        super(data);

        this.title = title;

        Object.assign(this, optionalProperties);
    }

    public abstract is(movie: Movie): boolean;

    public abstract import(container: MediaContainer): Promise<Movie>;

    public abstract getAttributes(): Promise<Attributes>;

}
