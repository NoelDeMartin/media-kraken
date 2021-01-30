import { Store } from 'vuex';

import Services from '@/services';

export type ComputedStateDefinitions<State, ComputedState> = {
    [ComputedProperty in keyof ComputedState]:
        (state: State, computed: ComputedState) => ComputedState[ComputedProperty];
};

export default abstract class Service<State = {}, ComputedState = {}> {


    public readonly ready: Promise<void>;

    protected readonly storeNamespace: string = '';

    private resolveReady!: () => void;
    private rejectReady!: () => void;
    private _computedState?: ComputedState;

    constructor() {
        this.ready = new Promise((resolve, reject) => {
            this.resolveReady = resolve;
            this.rejectReady = reject;
        });
    }

    public launch(): Promise<void> {
        this.boot().then(this.resolveReady).catch(this.rejectReady);

        return this.ready;
    }

    protected get state(): State {
        return Services.$store.state[this.storeNamespace] || this.getInitialState();
    }

    protected getComputedState<P extends keyof ComputedState>(property: P): ComputedState[P] {
        return Services.$store.getters[`${this.storeNamespace}/${property}`];
    }

    protected async boot(): Promise<void> {
        this.registerStoreModule(Services.$store);
    }

    protected registerStoreModule(store: Store<State>): void {
        const initialState = this.getInitialState();

        if (Object.keys(initialState).length === 0)
            return;

        store.registerModule(this.storeNamespace, {
            namespaced: true,
            state: initialState,
            mutations: {
                setState: (state: State, newState: Partial<State>) => {
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
            (state, computed) => getter(state[this.storeNamespace], computed),
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
        Services.$store.commit(`${this.storeNamespace}/setState`, newState);
    }

}
