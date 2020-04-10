import { TMDBMovie } from '@/api/TheMovieDBApi';

import Movie from '@/models/soukai/Movie';

import { MediaParser } from '@/services/Media';

type Data = TMDBMovie;

class TMDBMoviesParser implements MediaParser<Data, Movie> {

    public validate(_: any): void {
        throw new Error('TMDB movies validation is not implemented');
    }

    public parse(data: Data): Movie {
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

export default new TMDBMoviesParser();
