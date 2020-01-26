export default abstract class User {

    public name: string;
    public avatarUrl: string | null;
    public storages: string[];

    constructor(name: string, avatarUrl: string | null, storages: string[]) {
        this.name = name;
        this.avatarUrl = avatarUrl;
        this.storages = storages;
    }

}
