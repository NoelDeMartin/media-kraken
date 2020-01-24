export default class Movie {

    public id: string;
    public title: string;
    public posterUrl: string;
    public externalUrl: string;

    constructor(id: string, title: string, posterUrl: string, externalUrl: string) {
        this.id = id;
        this.title = title;
        this.posterUrl = posterUrl;
        this.externalUrl = externalUrl;
    }

}
