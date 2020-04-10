import Movie from '@/models/soukai/Movie';

export default abstract class ThirdPartyMovie<Data=any> {

    public data: Data;

    constructor(data: Data) {
        this.data = data;
    }

    public abstract toModel(): Movie;

}
