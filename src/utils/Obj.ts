class Obj {

    public only<T, K extends keyof T>(
        obj: T, keys: K[],
    ): { [k in K]: T[k] } {
        const newObject: any = {};

        for (const key of keys) {
            if (!(key in obj))
                continue;

            newObject[key] = obj[key];
        }

        return newObject;
    }

    public without<T, K extends keyof T>(
        obj: T, keys: K[],
    ): Omit<T, keyof { [k in K]: any }> {
        const newObject: T = { ...obj };

        for (const key of keys) {
            delete newObject[key];
        }

        return newObject;
    }

    public withoutUndefined<T>(obj: T): T {
        return this.flattenEntries(
            Object
                .entries(obj)
                .filter(([_, value]) => value !== undefined),
        );
    }

    public flattenEntries<T = any>(entries: [string, any][], target?: T): T {
        return entries.reduce((flattened: any, [key, value]) => {
            flattened[key] = value;

            return flattened;
        }, target || {} as T);
    }

}

export default new Obj();
