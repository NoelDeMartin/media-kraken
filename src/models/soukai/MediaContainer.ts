import { MultiModelRelation, FieldType } from 'soukai';
import { SolidContainerModel, SolidContainsRelation } from 'soukai-solid';

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
    public relatedMovies!: SolidContainsRelation<MediaContainer, Movie, typeof Movie>;

    public moviesRelationship(): MultiModelRelation {
        return this.contains(Movie);
    }

}
