import { Store } from 'vuex';

import Service from '@/services/Service';

import Arr from '@/utils/Arr';

const ESC_KEY_CODE = 27;
const NON_WRITABLE_INPUT_TYPES = ['submit', 'reset', 'checkbox', 'radio'];

interface State {
    open: boolean;
    query: string;
}

export default class Search extends Service {

    private searchInput: HTMLInputElement | null = null;

    private keyboardListener: EventListener | null = null;

    public get query(): string {
        return this.app.$store.state.search.query || '';

    }

    public get searching(): boolean {
        return this.app.$store.state.search.open || false;
    }

    public setSearchInput(input: HTMLInputElement | null): void {
        this.searchInput = input;

        input === null
            ? this.stopListeningKeyboard()
            : this.startListeningKeyboard();
    }

    public async open(): Promise<void> {
        if (this.searchInput === null)
            return;

        this.app.$store.commit('setOpen', true);

        // TODO refactor (why does nextTick not work?)
        setTimeout(() => this.searchInput!.focus(), 100);
    }

    public close(): void {
        this.app.$store.commit('setOpen', false);
    }

    public update(query: string): void {
        this.app.$store.commit('setQuery', query);
    }

    protected registerStoreModule(store: Store<State>): void {
        store.registerModule('search', {
            state: {
                open: false,
                query: '',
            },
            mutations: {
                setOpen(state: State, open: boolean) {
                    state.open = open;
                },
                setQuery(state: State, query: string) {
                    state.query = query;
                },
            },
        });
    }

    private startListeningKeyboard() {
        if (this.keyboardListener)
            return;

        document.addEventListener('keydown', this.keyboardListener = event => {
            if (!this.captureHotKey(event as KeyboardEvent))
                return;

            event.preventDefault();
        });
    }

    private stopListeningKeyboard() {
        if (!this.keyboardListener)
            return;

        document.removeEventListener('keydown', this.keyboardListener);

        this.keyboardListener = null;
    }

    private captureHotKey({ target, key, keyCode }: KeyboardEvent): boolean {
        if (
            this.searching &&
            target === this.searchInput &&
            keyCode === ESC_KEY_CODE
        ) {
            this.close();

            return true;
        }

        if (
            !this.searching &&
            Arr.contains(['s', '/'], key.toLowerCase()) &&
            !this.isWritable(target)
        ) {
            this.open();

            return true;
        }

        return false;
    }

    private isWritable(element: any): boolean {
        if (!(element instanceof HTMLElement))
            return false;

        const name = element.nodeName.toLowerCase();

        return name === 'select'
            || (
                name === 'input' &&
                !Arr.contains(
                    NON_WRITABLE_INPUT_TYPES,
                    (element.getAttribute('type') || '').toLowerCase(),
                )
            )
            || name === 'textarea'
            || element.isContentEditable;
    }

}
