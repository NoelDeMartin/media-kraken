import { Attributes } from 'soukai';

import MediaContainer from '@/models/soukai/MediaContainer';
import Movie from '@/models/soukai/Movie';
import ThirdPartyMovie from '@/models/third-party/ThirdPartyMovie';

import Arr from '@/utils/Arr';
import Time from '@/utils/Time';

interface Data {
    title: string;
    posterUrl?: string;
    watchedAt?: string;
    externalUrls?: string[];
}

export default class JSONMovie extends ThirdPartyMovie {

    public static isValidData(data: any): data is Data {
        return typeof data.title === 'string'
            && (
                !data.posterUrl || (
                    typeof data.posterUrl === 'string' &&
                    data.posterUrl.startsWith('http')
                )
            )
            && (
                !data.watchedAt || (
                    typeof data.watchedAt === 'string' &&
                    Time.isValidDateString(data.watchedAt)
                )
            )
            && (
                !data.externalUrls || (
                    Array.isArray(data.externalUrls) &&
                    !!data.externalUrls.find((url: any) => typeof url !== 'string') &&
                    !!data.externalUrls.find((url: string) => !url.startsWith('http'))
                )
            );
    }

    protected data!: Data;

    private get externalUrls(): string[] {
        return this.data.externalUrls || [];
    }

    public is(movie: Movie): boolean {
        return !!this.externalUrls.find(url => Arr.contains(movie.externalUrls, url));
    }

    public async import(container: MediaContainer): Promise<Movie> {
        const attributes = await this.getAttributes();
        const movie = await container.createMovie(attributes);

        if (this.data.watchedAt)
            await movie.watch(new Date(this.data.watchedAt));

        return movie;
    }

    public async getAttributes(): Promise<Attributes> {
        return {
            title: this.data.title,
            posterUrl: this.data.posterUrl,
            externalUrls: this.externalUrls,
        };
    }

}
