import Movie, { MovieJSON } from '@/models/soukai/Movie';
import ThirdPartyMovie from '@/models/third-party/ThirdPartyMovie';

import Obj from '@/utils/Obj';
import Time from '@/utils/Time';

type Data = MovieJSON;

export default class JSONMovie extends ThirdPartyMovie<Data> {

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
                !('externalUrls' in data) || (
                    Array.isArray(data.externalUrls) &&
                    !data.externalUrls.find((url: any) => typeof url !== 'string') &&
                    !data.externalUrls.find((url: string) => !url.startsWith('http'))
                )
            )
            && (
                !('watchedAt' in data) || (
                    typeof data.watchedAt === 'string' &&
                    Time.isValidDateString(data.watchedAt)
                )
            );
    }

    public toModel(): Movie {
        const data = this.data;
        const movie = new Movie(Obj.without(data, ['watchedAt']));

        movie.setRelationModels('actions', []);

        if (data.watchedAt)
            movie.watch(data.watchedAt);

        return movie;
    }

}
