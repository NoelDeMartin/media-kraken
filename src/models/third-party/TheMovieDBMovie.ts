import Movie from '@/models/soukai/Movie';
import ThirdPartyMovie from '@/models/third-party/ThirdPartyMovie';

export interface Data {
    id: number;
    title: string;
    overview?: string | null;
    release_date?: string;
    poster_path?: string | null;
    imdb_id?: string | null;
}

export default class TheMovieDBMovie extends ThirdPartyMovie<Data> {

    public toModel(): Movie {
        const data = this.data;
        const movie = new Movie({
            title: data.title,
            description: data.overview,
            releaseDate: data.release_date,
            externalUrls: [`https://www.themoviedb.org/movie/${data.id}`],
        });

        movie.setRelationModels('actions', []);

        if (data.poster_path)
            movie.posterUrl = `https://image.tmdb.org/t/p/w342${data.poster_path}`;

        if (data.imdb_id)
            movie.externalUrls.push(`https://www.imdb.com/title/${data.imdb_id}`);

        return movie;
    }

}
