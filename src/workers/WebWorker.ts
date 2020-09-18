import Errors from '@/utils/Errors';
import Http, { SerializedResponse } from '@/utils/Http';
import Str from '@/utils/Str';
import UUID from '@/utils/UUID';

export interface WebWorkerMessage {
    name: string;
    payload: any;
}

export default abstract class WebWorker<Parameters extends any[], Result> {

    private operations: {
        [id: string]: {
            resolve: Function;
            reject: Function;
        };
    } = {};

    public async run(): Promise<void> {
        addEventListener(
            'message',
            async ({ data: { name, payload } }: { data: WebWorkerMessage }) => {
                switch (name) {
                    case 'start':
                        this.start(...payload);
                        break;
                    case 'operation-completed': {
                        const [ id, result ] = payload;

                        this.resolveOperation(id, result);
                        break;
                    }
                    case 'operation-failed': {
                        const [ id, error ] = payload;

                        this.rejectOperation(id, Errors.parse(error));
                        break;
                    }
                    default:
                        (this as any)['on' + Str.studly(name)]?.call(this, ...payload);
                        break;
                }
            },
        );
    }

    protected postMessage(name: string, ...payload: any[]): void {
        const message: WebWorkerMessage = { name, payload };

        (postMessage as any)(message);
    }

    protected runOperation<T>(name: string, ...args: any[]): Promise<T> {
        return new Promise((resolve, reject) => {
            const id = UUID.generate();

            this.operations[id] = { resolve, reject };

            this.postMessage('run-operation', id, name, args);
        });
    }

    protected async solidFetch(...args: any[]): Promise<Response> {
        const response = await this.runOperation<SerializedResponse>('solid-fetch', ...args);

        return Http.deserializeResponse(response);
    }

    protected abstract work(...params: Parameters): Promise<Result>;

    public async start(...parameters: Parameters): Promise<void> {
        try {
            const result = await this.work(...parameters);

            this.postMessage('done', result);
        } catch (e) {
            this.postMessage('failed', Errors.serialize(e));
        }
    }

    private resolveOperation(id: string, result: any): void {
        this.operations[id]?.resolve(result);
        delete this.operations[id];
    }

    private rejectOperation(id: string, error: any): void {
        this.operations[id]?.reject(error);
        delete this.operations[id];
    }

}
