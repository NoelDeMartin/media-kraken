import { TMDBMovie } from '@/api/TheMovieDBApi';

import Movie from '@/models/soukai/Movie';

import { MediaParser } from '@/utils/parsers';

type Data = TMDBMovie;

class TMDBMoviesParser implements MediaParser<Data, Movie> {

    public async validate(_: any): Promise<void> {
        throw new Error('TMDB movies validation is not implemented');
    }

    public async parse(data: Data): Promise<Movie> {
        const movie = new Movie({
            title: data.title,
            externalUrls: [`https://www.themoviedb.org/movie/${data.id}`],
        });

        if (data.overview)
            movie.description = data.overview;

        if (data.release_date)
            movie.releaseDate = new Date(data.release_date);

        if (data.poster_path)
            movie.posterUrl = `https://image.tmdb.org/t/p/w500${data.poster_path}`;

        if (data.imdb_id)
            movie.externalUrls.push(`https://www.imdb.com/title/${data.imdb_id}`);

        movie.setRelationModels('actions', []);

        return movie;
    }

}

export default new TMDBMoviesParser();
