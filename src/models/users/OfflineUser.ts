import User from '@/models/users/User';

interface OfflineUserJson {
    name: string;
    avatar_url: string | null;
    storages: string[];
}

export default class OfflineUser extends User {

    public static fromJson(json: OfflineUserJson): OfflineUser {
        return new OfflineUser(json.name, json.avatar_url, json.storages);
    }

    constructor(
        name: string = 'Local (offline)',
        avatarUrl: string | null = null,
        storages: string[] = ['local/'],
    ) {
        super(name, avatarUrl, storages);
    }

    public toJson(): OfflineUserJson {
        return {
            name: this.name,
            avatar_url: this.avatarUrl,
            storages: this.storages,
        };
    }

}
