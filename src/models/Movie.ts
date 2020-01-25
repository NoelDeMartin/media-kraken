import { FieldType } from 'soukai';
import { SolidModel } from 'soukai-solid';

export default class Movie extends SolidModel {

    public static fields = {
        title: FieldType.String,
        posterUrl: FieldType.String,
        externalUrl: FieldType.String,
        watched: FieldType.Boolean,
    };

}
