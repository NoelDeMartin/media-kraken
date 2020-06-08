import Movie, { MovieJSON } from '@/models/soukai/Movie';

import { MediaParser } from '@/utils/parsers';

type Data = MovieJSON;

class JSONLDMoviesParser implements MediaParser<Data, Movie> {

    public async validate(): Promise<void> {
        //
    }

    public parse(data: Data): Promise<Movie> {
        return Movie.newFromJsonLD(data);
    }

}

export default new JSONLDMoviesParser();
