import Movie from '@/models/soukai/Movie';
import ThirdPartyMovie from '@/models/third-party/ThirdPartyMovie';

import Arr from '@/utils/Arr';
import Time from '@/utils/Time';

const enum DataMediaType {
    Series = 1,
    Movie = 2,
    TVShow = 4,
}

enum Status {
    Watched = 'watched',
    Following = 'following',
    Pending = 'pending',
}

interface Data {
    title: string;
    imdb: string;
    type: DataMediaType;
    status: Status;
    checkedDate: string;
}

export default class TVisoMovie extends ThirdPartyMovie<Data> {

    public static isValidData(data: any): data is Data {
        return typeof data.title === 'string'
            && typeof data.imdb === 'string'
            && data.type === DataMediaType.Movie
            && Arr.contains(Object.values(Status), data.status)
            && (typeof data.checkedDate === 'string' && Time.isValidDateString(data.checkedDate));
    }

    public toModel(): Movie {
        const data = this.data;
        const movie = new Movie({
            title: data.title,
            externalUrls: [`https://www.imdb.com/title/${data.imdb}`],
        });

        movie.setRelationModels('actions', []);

        switch (data.status) {
            case Status.Pending:
                movie.createdAt = data.checkedDate;
                break;
            case Status.Watched:
                movie.watch(data.checkedDate);
                break;
        }

        return movie;
    }

}
