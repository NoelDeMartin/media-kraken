import Errors from '@/utils/Errors';
import Http, { SerializedResponse } from '@/utils/Http';
import UUID from '@/utils/UUID';

export interface WebWorkerMessage {
    operationId?: string;
    name: string;
    payload: any;
}

export default abstract class WebWorker<Parameters extends any[], Result> {

    private operations: Record<string, {
        resolve: Function;
        reject: Function;
    }> = {};

    public async listen(): Promise<void> {
        const handleMessage = async ({ data: { operationId, name, payload } }: { data: WebWorkerMessage }) => {
            switch (name) {
                case 'run':
                    this.run(...payload);
                    break;
                case 'operation-completed':
                    if (operationId && operationId in this.operations) {
                        this.operations[operationId]?.resolve(payload);
                        delete this.operations[operationId];
                    }
                    break;
                case 'operation-failed':
                    if (operationId && operationId in this.operations) {
                        this.operations[operationId]?.reject(payload);
                        delete this.operations[operationId];
                    }
                    break;
            }
        };

        addEventListener('message', handleMessage);
    }

    protected runOperation<T>(name: string, ...payload: any[]): Promise<T> {
        return new Promise((resolve, reject) => {
            const operationId = UUID.generate();

            this.operations[operationId] = { resolve, reject };

            this.postMessage({ operationId, name, payload });
        });
    }

    protected async solidFetch(...args: any[]): Promise<Response> {
        const response = await this.runOperation<SerializedResponse>('solid-fetch', ...args);

        return Http.deserializeResponse(response);
    }

    protected async run(...parameters: Parameters): Promise<void> {
        try {
            const result = await this.work(...parameters);

            this.postMessage({ name: 'work-completed', payload: result });
        } catch (e) {
            this.postMessage({ name: 'work-failed', payload: Errors.serialize(e) });
        }
    }

    protected abstract work(...params: Parameters): Promise<Result>;

    private postMessage(message: WebWorkerMessage) {
        (postMessage as any)(message);
    }

}
