import App from '@/services/App';

import Storage from '@/utils/Storage';
import Str from '@/utils/Str';

export default class Migration {

    private version: string;
    private migrationScript: Function;

    constructor(version: string, migrationScript: Function) {
        this.version = version;
        this.migrationScript = migrationScript;
    }

    public isNecessary(storageVersion: string): boolean {
        const [storageMajor, storageMinor, storagePatch] = Str.parseVersion(storageVersion)!;
        const [migrationMajor, migrationMinor, migrationPatch] = Str.parseVersion(this.version)!;

        if (migrationMajor !== storageMajor)
            return migrationMajor > storageMajor;

        if (migrationMinor !== storageMinor)
            return migrationMinor > storageMinor;

        return migrationPatch > storagePatch;
    }

    public async apply(): Promise<string> {
        await this.migrationScript();

        Storage.set(App.VERSION_STORAGE_KEY, this.version);

        return this.version;
    }

}
