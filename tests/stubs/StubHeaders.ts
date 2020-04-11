interface HeaderData {
    [header: string]: string;
}

export default class StubHeaders implements Headers {

    public static make(data: HeaderData): StubHeaders {
        return new StubHeaders(data);
    }

    private data: HeaderData;

    private constructor(data: HeaderData) {
        this.data = {};

        for (const name in data) {
            this.set(name, data[name]);
        }
    }

    public append(name: string, value: string): void {
        this.data[this.normalizeHeader(name)] = value;
    }

    public delete(name: string): void {
        delete this.data[this.normalizeHeader(name)];
    }

    public get(name: string): string | null {
        return this.data[this.normalizeHeader(name)];
    }

    public has(name: string): boolean {
        return this.normalizeHeader(name) in this.data;
    }

    public set(name: string, value: string): void {
        this.data[this.normalizeHeader(name)] = value;
    }

    public forEach(callbackfn: (value: string, key: string, parent: Headers) => void): void {
        for (const key in this.data) {
            callbackfn(this.data[key], key, this);
        }
    }

    public [Symbol.iterator](): IterableIterator<[string, string]> {
        throw new Error('Method not implemented.');
    }

    public entries(): IterableIterator<[string, string]> {
        throw new Error('Method not implemented.');
    }

    public keys(): IterableIterator<string> {
        throw new Error('Method not implemented.');
    }

    public values(): IterableIterator<string> {
        throw new Error('Method not implemented.');
    }

    private normalizeHeader(name: string): string {
        return name.toLowerCase();
    }

}
