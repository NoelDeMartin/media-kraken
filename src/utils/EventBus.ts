import { arr, FluentArray } from '@noeldemartin/utils';

export type EventListener<T=unknown> = (payload: T) => unknown;

export class EventBus {

    private listeners: Record<string, FluentArray<EventListener<any>>> = {};

    public on<T=unknown>(event: string, listener: EventListener<T>): () => void {
        if (!(event in this.listeners))
            this.listeners[event] = arr<EventListener>([]);

        this.listeners[event].push(listener);

        return () => this.off(event, listener);
    }

    public off<T=unknown>(event: string, listener: EventListener<T>): void {
        if (!(event in this.listeners))
            return;

        this.listeners[event].remove(listener);

        if (this.listeners[event].isEmpty())
            delete this.listeners[event];
    }

    public once(event: string, listener: EventListener): void {
        const unregister = this.on(event, payload => {
            listener(payload);
            unregister();
        });
    }

    public async emit(event: string, payload?: unknown): Promise<void> {
        if (!(event in this.listeners))
            return;

        const eventListeners = this.listeners[event];

        await Promise.all(eventListeners.map(listener => listener(payload)));
    }

    public until(event: string): Promise<unknown> {
        return new Promise(resolve => this.once(event, resolve));
    }

}

export default new EventBus();
