export default class StubResponse implements Response {

    public static success(content: string = ''): StubResponse {
        return new StubResponse(200, content);
    }

    public static notFound(): StubResponse {
        return new StubResponse(404);
    }

    private content: string;

    public readonly body!: ReadableStream | null;
    public readonly bodyUsed!: boolean;
    public readonly headers!: Headers;
    public readonly ok!: boolean;
    public readonly redirected!: boolean;
    public readonly status: number;
    public readonly statusText!: string;
    public readonly trailer!: Promise<Headers>;
    public readonly type!: ResponseType;
    public readonly url!: string;

    private constructor(status: number, content: string = '') {
        this.status = status;
        this.content = content;
    }

    public async arrayBuffer(): Promise<ArrayBuffer> {
        throw new Error('Method not implemented.');
    }

    public async blob(): Promise<Blob> {
        throw new Error('Method not implemented.');
    }

    public async formData(): Promise<FormData> {
        throw new Error('Method not implemented.');
    }

    public async json<T>(): Promise<T> {
        return JSON.parse(this.content);
    }

    public async text(): Promise<string> {
        return this.content;
    }

    public clone(): Response {
        return new StubResponse(this.status, this.content);
    }

}
