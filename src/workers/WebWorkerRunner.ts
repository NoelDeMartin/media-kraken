import SolidAuthClient from 'solid-auth-client';

import Http from '@/utils/Http';
import Str from '@/utils/Str';

import { WebWorkerMessage } from './WebWorker';

export interface WebWorkerRunnerListener {
    [event: string]: ((...args: any[]) => void) | undefined;
}

export default class WebWorkerRunner<Parameters extends any[], Result> {

    private worker: Worker;
    private listener: WebWorkerRunnerListener;
    private workerPromise: Promise<Result>;

    private _resolve!: Function;
    private _reject!: Function;

    constructor(worker: Worker, listener: WebWorkerRunnerListener = {}) {
        this.worker = worker;
        this.listener = listener;
        this.workerPromise = new Promise<Result>((resolve, reject) => {
            this._resolve = resolve;
            this._reject = reject;
        });

        worker.onerror = () => this.onError();
        worker.onmessage = ({ data: message }: { data: WebWorkerMessage }) => this.onMessage(message);
    }

    public run(...params: Parameters): Promise<Result> {
        this.postMessage('start', ...params);

        return this.workerPromise;
    }

    protected async onMessage({ name, payload }: WebWorkerMessage): Promise<void> {
        switch (name) {
            case 'done':
                this._resolve(payload[0]);
                break;
            case 'failed':
                this._reject(payload[0]);
                break;
            case 'run-operation': {
                const [id, name, args] = payload;

                try {
                    const result = await this.handleOperation(name, args);

                    this.postMessage('operation-completed', id, result);
                } catch (e) {
                    this.postMessage('operation-failed', id, e.message || 'Unknown error');

                    // eslint-disable-next-line no-console
                    console.error(e);
                }
                break;
            }
            default:
                this.listener['on' + Str.studly(name)]?.call(this.listener, ...payload);
        }
    }

    protected onError(): void {
        this._reject();
    }

    protected postMessage(name: string, ...params: any[]): void {
        this.worker.postMessage({ name, payload: params });
    }

    protected async handleOperation(name: string, args: any[]): Promise<any> {
        switch (name) {
            case 'solid-fetch': {
                const response = await SolidAuthClient.fetch(...(args as [string, any]));

                return Http.serializeResponse(response);
            }
        }

        throw new Error(`Unknown worker operation: ${name}`);
    }

}
