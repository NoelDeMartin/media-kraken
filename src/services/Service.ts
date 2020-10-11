import { Store } from 'vuex';

import Services from '@/services';

export type ComputedStateDefinitions<State, ComputedState> = {
    [ComputedProperty in keyof ComputedState]:
        (state: State, computed: ComputedState) => ComputedState[ComputedProperty];
};

export default abstract class Service<State = {}, ComputedState = {}> {

    protected storeName: string = '';

    public readonly ready: Promise<void>;
    private resolveReady!: () => void;
    private rejectReady!: () => void;

    constructor() {
        this.ready = new Promise((resolve, reject) => {
            this.resolveReady = resolve;
            this.rejectReady = reject;
        });
    }

    public boot(): Promise<void> {
        this.init().then(this.resolveReady).catch(this.rejectReady);

        return this.ready;
    }

    protected get state(): State {
        return Services.$store.state[this.storeName] || this.getInitialState();
    }

    protected get computedState(): ComputedState {
        return Services.$store.getters;
    }

    protected async init(): Promise<void> {
        this.registerStoreModule(Services.$store);
    }

    protected registerStoreModule(store: Store<State>): void {
        const initialState = this.getInitialState();

        if (Object.keys(initialState).length === 0)
            return;

        store.registerModule(this.storeName, {
            state: initialState,
            mutations: {
                [`${this.storeName}.setState`]: (state: State, newState: Partial<State>) => {
                    Object.assign(state, newState);
                },
            },
            getters: this.getComputedStateDefinitions(),
        });
    }

    protected watchStore<T>(
        getter: (state: State, computed: ComputedState) => T,
        callback: (oldValue: T, newValue: T) => void,
    ): () => void {
        return Services.$store.watch(
            (state, computed) => getter(state[this.storeName], computed),
            callback,
        );
    }

    protected getInitialState(): State {
        return {} as any;
    }

    protected getComputedStateDefinitions(): ComputedStateDefinitions<State, ComputedState> {
        return {} as any;
    }

    protected setState(newState: Partial<State>): void {
        Services.$store.commit(`${this.storeName}.setState`, newState);
    }

}
