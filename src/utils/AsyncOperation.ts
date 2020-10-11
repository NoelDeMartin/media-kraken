import Services from '@/services';

class DefaultListener implements Listener {

    private static ongoingDelayedOperations: number = 0;
    private static snackbarId: string | null = null;

    private delayed: boolean = false;

    public onDelayed(): void {
        DefaultListener.ongoingDelayedOperations++;
        this.delayed = true;
        this.synchronizeUI();
    }

    public onCompleted(): void {
        if (!this.delayed)
            return;

        DefaultListener.ongoingDelayedOperations--;
        this.synchronizeUI();
    }

    public onFailed(error?: any): void {
        if (!this.delayed)
            return;

        DefaultListener.ongoingDelayedOperations--;
        this.synchronizeUI();

        if (error)
            Services.$ui.showError(error);
    }

    private synchronizeUI(): void {
        if (DefaultListener.ongoingDelayedOperations === 0) {
            this.hideSnackbar();

            return;
        }

        const message = DefaultListener.ongoingDelayedOperations === 1
            ? 'Saving changes...'
            : `Saving ${DefaultListener.ongoingDelayedOperations} changes...`;

        this.updateSnackbar(message) || this.showSnackbar(message);
    }

    private showSnackbar(message: string): void {
        const snackbar = Services.$ui.showSnackbar(message, { loading: true });

        DefaultListener.snackbarId = snackbar.id;
    }

    private updateSnackbar(message: string): boolean {
        if (DefaultListener.snackbarId === null)
            return false;

        Services.$ui.updateSnackbar(DefaultListener.snackbarId, message);

        return true;
    }

    private hideSnackbar(): void {
        if (DefaultListener.snackbarId === null)
            return;

        Services.$ui.hideSnackbar(DefaultListener.snackbarId);
        DefaultListener.snackbarId = null;
    }

}

export interface Listener {
    onStarted?(): void;
    onDelayed?(): void;
    onCompleted?(): void;
    onFailed?(error?: any): void;
}

export default class AsyncOperation {

    public static DEFAULT_EXPECTED_DURATION = 1000;

    private listener: Listener;
    private delayTimeout?: NodeJS.Timeout;

    constructor(listener?: Listener) {
        this.listener = listener || new DefaultListener;
    }

    public start(expectedDuration?: number): void {
        this.delayTimeout = setTimeout(
            () => this.emit('onDelayed'),
            expectedDuration || AsyncOperation.DEFAULT_EXPECTED_DURATION,
        );

        this.emit('onStarted');
    }

    public complete(): void {
        this.clearDelayTimeout();

        this.emit('onCompleted');
    }

    public fail(error?: any): void {
        this.clearDelayTimeout();

        this.emit('onFailed', error);
    }

    private clearDelayTimeout() {
        if (!this.delayTimeout)
            return;

        clearTimeout(this.delayTimeout);
        delete this.delayTimeout;
    }

    private emit(event: keyof Listener, ...args: any[]): void {
        if (event in this.listener)
            (this.listener[event] as any)(...args);
    }

}
