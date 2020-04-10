import Vue from 'vue';

import { Store } from 'vuex';

export type ComputedStateDefinitions<State, ComputedState> = {
    [ComputedProperty in keyof ComputedState]:
        (state: State, computed: ComputedState) => ComputedState[ComputedProperty];
};

export default abstract class Service<State = void, ComputedState = {}> {

    protected app: Vue;
    protected storeName: string = '';

    public readonly ready: Promise<void>;

    constructor(app: Vue, ...args: any[]) {
        this.app = app;

        // defer calling init() until constructor has completed
        this.ready = Promise.resolve().then(() => this.init(...args));
    }

    protected get state(): State {
        return this.app.$store.state[this.storeName] || this.getInitialState();
    }

    protected get computedState(): ComputedState {
        return this.app.$store.getters;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected async init(...args: any[]): Promise<void> {
        this.registerStoreModule(this.app.$store);
    }

    protected registerStoreModule(store: Store<State>): void {
        const initialState = this.getInitialState();

        if (initialState === null)
            return;

        store.registerModule(this.storeName, {
            state: initialState,
            mutations: {
                setState(state: State, newState: Partial<State>) {
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
        return this.app.$store.watch(
            (state, computed) => getter(state[this.storeName], computed),
            callback,
        );
    }

    protected getInitialState(): State {
        return null as any;
    }

    protected getComputedStateDefinitions(): ComputedStateDefinitions<State, ComputedState> {
        return {} as any;
    }

    protected setState(newState: Partial<State>): void {
        this.app.$store.commit('setState', newState);
    }

}
