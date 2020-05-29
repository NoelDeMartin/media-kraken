import OfflineUser from '@/models/users/OfflineUser';
import SolidUser from '@/models/users/SolidUser';
import User from '@/models/users/User';

class JSONUserParser {

    public async parse(json: object): Promise<User> {
        if (SolidUser.isSolidUserJSON(json))
            return SolidUser.fromJSON(json);

        if (OfflineUser.isOfflineUserJSON(json))
            return new OfflineUser();

        throw new Error('Invalid User JSON');
    }

}

export default new JSONUserParser();
