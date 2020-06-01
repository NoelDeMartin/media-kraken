import Soukai, { MultiModelRelation, FieldType } from 'soukai';
import { SolidEngine, SolidContainerModel } from 'soukai-solid';

import Movie from '@/models/soukai/Movie';

export default class MediaContainer extends SolidContainerModel {

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

    public async saveMovie(movie: Movie): Promise<void> {
        // TODO implement this.moviesRelationship().save(movie); in soukai

        await movie.save(this.url);

        if (!(Soukai.engine instanceof SolidEngine))
            await this.update({
                resourceUrls: [...this.resourceUrls, movie.url],
            });

        if (this.isRelationLoaded('movies'))
            this.setRelationModels('movies', [...this.movies || [], movie]);
    }

}
