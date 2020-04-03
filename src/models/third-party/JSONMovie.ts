import { Attributes } from 'soukai';
import dayjs from 'dayjs';

import MediaContainer from '@/models/soukai/MediaContainer';
import Movie, { MovieJSON } from '@/models/soukai/Movie';
import ThirdPartyMovie from '@/models/third-party/ThirdPartyMovie';

import Arr from '@/utils/Arr';
import Time from '@/utils/Time';

type Data = MovieJSON;

export default class JSONMovie extends ThirdPartyMovie {

    public static isValidData(data: any): data is Data {
        return typeof data.title === 'string'
            && (!('description' in data) || typeof data.description === 'string')
            && (
                !('releaseDate' in data) || (
                    typeof data.releaseDate === 'string' &&
                    Time.isValidDateString(data.releaseDate)
                )
            )
            && (
                !('posterUrl' in data) || (
                    typeof data.posterUrl === 'string' &&
                    data.posterUrl.startsWith('http')
                )
            )
            && (
                !('watchedAt' in data) || (
                    typeof data.watchedAt === 'string' &&
                    Time.isValidDateString(data.watchedAt)
                )
            )
            && (
                !('externalUrls' in data) || (
                    Array.isArray(data.externalUrls) &&
                    !data.externalUrls.find((url: any) => typeof url !== 'string') &&
                    !data.externalUrls.find((url: string) => !url.startsWith('http'))
                )
            );
    }

    public data!: Data;

    constructor(data: Data) {
        super(data, data.title, {
            description: data.description,
            posterUrl: data.posterUrl,
            releaseDate: data.releaseDate ? dayjs(data.releaseDate) : undefined,
        });
    }

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

    private async getAttributes(): Promise<Attributes> {
        return {
            title: this.data.title,
            posterUrl: this.data.posterUrl,
            externalUrls: this.externalUrls,
        };
    }

}
