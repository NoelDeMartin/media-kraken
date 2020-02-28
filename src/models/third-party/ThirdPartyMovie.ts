import { Attributes } from 'soukai';

import Movie from '@/models/soukai/Movie';
import MediaContainer from '@/models/soukai/MediaContainer';

export default abstract class ThirdPartyMovie {

    protected data: any;

    constructor(data: any) {
        this.data = data;
    }

    public abstract is(movie: Movie): boolean;

    public abstract import(container: MediaContainer): Promise<Movie>;

    public abstract getAttributes(): Promise<Attributes>;

}
