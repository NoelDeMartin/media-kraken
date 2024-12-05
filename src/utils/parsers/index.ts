import { SolidModel } from 'soukai-solid';

export interface MediaParser<Data, Model extends SolidModel> {
    prepare?(data: any[]): void;
    validate(data: any): Promise<void>;
    parse(data: Data): Promise<Model>;
}
