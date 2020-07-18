class Storage {

    public set(key: string, value: any): void {
        if (typeof value === 'undefined')
            value = '__undefined__';

        localStorage.setItem(key, JSON.stringify(value));
    }

    public get(key: string, defaultValue: any = null): any {
        const value = localStorage.getItem(key);

        if (value === null)
            return defaultValue;

        if (value === '__undefined__')
            return undefined;

        return JSON.parse(value);
    }

    public has(key: string): boolean {
        return localStorage.getItem(key) !== null;
    }

    public remove(key: string): void {
        localStorage.removeItem(key);
    }

    public pull(key: string, defaultValue: any = null): any {
        if (!this.has(key))
            return defaultValue;

        const value = this.get(key);

        this.remove(key);

        return value;
    }

}

export default new Storage();
