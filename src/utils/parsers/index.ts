import { SolidModel } from 'soukai-solid';

export interface MediaParser<Data, Model extends SolidModel> {
    validate(data: any): void;
    parse(data: Data): Model;
}
