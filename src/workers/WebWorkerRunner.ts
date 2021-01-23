import SolidAuth from '@/authentication/SolidAuth';

import Errors from '@/utils/Errors';
import Http from '@/utils/Http';
import Str from '@/utils/Str';

import { WebWorkerMessage } from './WebWorker';

export type WebWorkerRunnerDelegate = Record<string, (...args: any[]) => unknown>;

export default class WebWorkerRunner<Parameters extends any[], Result> {

    private worker: Worker;
    private delegate: WebWorkerRunnerDelegate;
    private workerPromise: Promise<Result>;

    private _resolve!: Function;
    private _reject!: Function;

    constructor(worker: Worker, delegate: WebWorkerRunnerDelegate = {}) {
        this.worker = worker;
        this.delegate = delegate;
        this.workerPromise = new Promise<Result>((resolve, reject) => {
            this._resolve = resolve;
            this._reject = reject;
        });

        worker.onerror = () => this._reject();
        worker.onmessage = ({ data: message }: { data: WebWorkerMessage }) => this.onMessage(message);
    }

    public run(...params: Parameters): Promise<Result> {
        this.worker.postMessage({ name: 'run', payload: params });

        return this.workerPromise;
    }

    protected async onMessage({ operationId, name, payload }: WebWorkerMessage): Promise<void> {
        switch (name) {
            case 'work-completed':
                this._resolve(payload);
                break;
            case 'work-failed':
                this._reject(Errors.parse(payload));
                break;
            default: {
                try {
                    const result = await this.handleOperation(name, payload);

                    this.worker.postMessage({ operationId, name: 'operation-completed', payload: result });
                } catch (e) {
                    this.worker.postMessage({ operationId, name: 'operation-failed', payload: Errors.serialize(e) });
                }
                break;
            }
        }
    }

    protected async handleOperation(name: string, args: any[]): Promise<any> {
        if (name in this.delegate)
            return this.delegate[name](...args);

        const camelCaseName = Str.camel(name);
        if (camelCaseName in this.delegate)
            return this.delegate[camelCaseName](...args);

        switch (name) {
            case 'solid-fetch': {
                const response = await SolidAuth.fetch(...(args as [string, any]));

                return Http.serializeResponse(response);
            }
        }

        throw new Error(`Unknown worker operation: ${name}`);
    }

}
