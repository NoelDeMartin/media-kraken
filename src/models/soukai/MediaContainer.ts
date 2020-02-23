import Soukai, { MultiModelRelation, FieldType, Attributes } from 'soukai';
import { SolidModel, SolidEngine } from 'soukai-solid';

import Movie from '@/models/soukai/Movie';

export default class MediaContainer extends SolidModel {

    public static ldpContainer = true;

    public static fields = {
        name: {
            type: FieldType.String,
            rdfProperty: 'rdfs:label',
            required: true,
        },
    };

    public movies?: Movie[];

    public moviesRelationship(): MultiModelRelation {
        return this.contains(Movie);
    }

    public async createMovie(attributes: Attributes): Promise<Movie> {
        // TODO implement this.moviesRelationship().create(attributes); in soukai

        const movie = new Movie(attributes);

        // TODO catch errors
        await movie.save(this.url);

        if (!(Soukai.engine instanceof SolidEngine))
            await this.update({
                resourceUrls: [...this.resourceUrls, movie.url],
            });

        movie.setRelationModels('actions', []);

        if (this.isRelationLoaded('movies'))
            this.setRelationModels('movies', [...this.movies || [], movie]);

        return movie;
    }

}
