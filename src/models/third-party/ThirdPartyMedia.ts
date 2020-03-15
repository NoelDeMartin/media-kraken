export enum MediaSource {
    TViso = 'tviso',
    JSON = 'json',
}

export const mediaSourceNames = {
    [MediaSource.TViso]: 'TViso',
    [MediaSource.JSON]: 'JSON',
};

export default abstract class ThirdPartyMedia {

    public data: any;

    constructor(data: any) {
        this.data = data;
    }

}
