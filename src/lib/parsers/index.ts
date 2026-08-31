import type Movie from '@/models/Movie';

export interface MediaParser<Data, Model = Movie> {
    prepare?(data: any[]): void;
    validate(data: any): Promise<void>;
    parse(data: Data): Promise<Model>;
}
