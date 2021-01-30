import { SolidModel } from 'soukai-solid';
import { Component } from 'vue';

import Service, { ComputedStateDefinitions } from '@/services/Service';

import Arr from '@/utils/Arr';
import AsyncOperation from '@/utils/AsyncOperation';
import Errors from '@/utils/Errors';
import EventBus from '@/utils/EventBus';
import Obj from '@/utils/Obj';
import Storage from '@/utils/Storage';
import UUID from '@/utils/UUID';

import AlertModal from '@/components/modals/AlertModal.vue';
import ConfirmModal from '@/components/modals/ConfirmModal.vue';
import ErrorInfoModal from '@/components/modals/ErrorInfoModal.vue';
import LoadingModal from '@/components/modals/LoadingModal.vue';
import MarkdownModal from '@/components/modals/MarkdownModal.vue';

enum Layout {
    Mobile = 'mobile',
    Desktop = 'desktop',
}

interface State {
    layoutMediaQueries: {
        [layout in Layout]: boolean;
    };
    headerHidden: boolean;
    menuOpen: boolean;
    modals: Modal[];
    snackbars: Snackbar[];
    animations: boolean;
}

interface ComputedState {
    layout: Layout;
    mobile: boolean;
    showOverlay: boolean;
}

interface ClickAwayListener {
    isAway(target: HTMLElement): boolean;
    callback(): void | boolean;
}

interface ConfirmOptions {
    markdown?: boolean;
    acceptLabel?: string;
    cancelLabel?: string;
}

export const screenBreakpoints: { [layout in Layout]?: number } = {
    [Layout.Desktop]: 640,
};

export interface Modal<R=any> {
    id: string;
    component: Component;
    options: ModalOptions;
    props: object;
    result: Promise<R>;
}

export interface ModalOptions {
    cancellable: boolean;
}

export interface Snackbar {
    id: string;
    message: string;
    options: SnackbarOptions;
}

export interface SnackbarOptions {
    loading: boolean;
    error: boolean;
    transient: boolean;
    action?: SnackbarAction;
    lifetime?: number;
}

export interface SnackbarAction {
    text: string;
    handler: Function;
}

const STORAGE_ANIMATIONS_KEY = 'media-kraken-animations';

export default class UI extends Service<State, ComputedState> {

    protected readonly storeNamespace: string = 'ui';

    private mobileMenu: HTMLElement | null = null;
    private desktopMenu: HTMLElement | null = null;
    private menuTriggers: HTMLButtonElement[] = [];
    private myCollection: HTMLElement | null = null;
    private modalResolves: Record<string, Function> = {};

    private clickListener: EventListener | null = null;
    private removeMenuClickAwayListener: Function | null = null;
    private clickAwayListeners: ClickAwayListener[] = [];
    private bootupProgressMessage = document.querySelector('#bootup-overlay .progress-message') as HTMLParagraphElement;

    public get layout(): Layout {
        return this.getComputedState('layout');
    }

    public get mobile(): boolean {
        return this.getComputedState('mobile');
    }

    public get desktop(): boolean {
        return this.layout === Layout.Desktop;
    }

    public get headerHidden(): boolean {
        return this.state.headerHidden;
    }

    public get menuOpen(): boolean {
        return this.state.menuOpen;
    }

    public get myCollectionElement(): HTMLElement | null {
        return this.myCollection;
    }

    public get modals(): Modal[] {
        return this.state.modals;
    }

    public get snackbars(): Snackbar[] {
        return this.state.snackbars;
    }

    public get animationsEnabled(): boolean {
        return this.state.animations;
    }

    public get showOverlay(): boolean {
        return this.getComputedState('showOverlay');
    }

    private get menu(): HTMLElement | null {
        return this.mobile ? this.mobileMenu : this.desktopMenu;
    }

    public setMobileMenu(menu: HTMLElement | null) {
        this.mobileMenu = menu;
    }

    public setDesktopMenu(menu: HTMLElement | null) {
        this.desktopMenu = menu;
    }

    public addMenuTrigger(button: HTMLButtonElement) {
        if (this.menuTriggers.indexOf(button) !== -1)
            return;

        this.menuTriggers.push(button);
    }

    public removeMenuTrigger(button: HTMLButtonElement) {
        const index = this.menuTriggers.indexOf(button);

        if (index === -1)
            return;

        this.menuTriggers.splice(index, 1);
    }

    public setMyCollection(myCollection: HTMLElement | null) {
        this.myCollection = myCollection;
    }

    public async loading<T>(callback: () => Promise<T>, message?: string): Promise<T> {
        const modal = await this.openModal(LoadingModal, { message }, { cancellable: false });

        try {
            const result = await callback();

            return result;
        } finally {
            this.closeModal(modal.id, true);
        }
    }

    public showHeader() {
        this.setState({ headerHidden: false });
    }

    public hideHeader() {
        this.setState({ headerHidden: true });
    }

    public openMenu() {
        if (this.menuOpen)
            return;

        this.setState({ menuOpen: true });

        this.removeMenuClickAwayListener = this.onClickAway(
            target => (
                (!this.menu || (this.menu !== target && !this.menu!.contains(target))) &&
                !this.menuTriggers.find(trigger => target === trigger || trigger.contains(target))
            ),
            () => this.toggleMenu(),
        );
    }

    public closeMenu() {
        if (!this.menuOpen)
            return;

        this.setState({ menuOpen: false });

        if (!this.removeMenuClickAwayListener)
            return;

        this.removeMenuClickAwayListener();
        this.removeMenuClickAwayListener = null;
    }

    public toggleMenu() {
        this.menuOpen ? this.closeMenu() : this.openMenu();
    }

    public openFileMarkdownModal(file: string, replacements: any = {}): void {
        this.openModal(MarkdownModal, { file, replacements });
    }

    public openModal<R>(
        component: Component,
        props: object = {},
        partialOptions: Partial<ModalOptions> = {},
    ): Modal<R> {
        const id = UUID.generate();
        const result = new Promise<R>(resolve => this.modalResolves[id] = resolve);
        const options = {
            cancellable: true,
            ...partialOptions,
        };
        const modal = {
            id,
            options,
            component,
            result,
            props: {
                ...props,
                id,
                options,
            },
        };

        this.setState({
            modals: [
                ...this.modals,
                modal,
            ],
        });

        return modal;
    }

    public closeModal(id: string, force: boolean = false) {
        const index = this.modals.findIndex(modal => modal.id === id);

        if (index === -1)
            return;

        if (!force && !this.modals[index].options.cancellable)
            return;

        if (id in this.modalResolves) {
            this.modalResolves[id]();

            delete this.modalResolves[id];
        }

        this.setState({ modals: Arr.withoutIndex(this.modals, index) });
    }

    public resolveModal(id: string, result: any) {
        if (id in this.modalResolves) {
            this.modalResolves[id](result);

            delete this.modalResolves[id];
        }

        this.closeModal(id, true);
    }

    public alert(message: string): void;
    public alert(title: string, message: string): void;
    public alert(titleOrMessage: string, message?: string): void {
        const title = message ? titleOrMessage : undefined;
        message = message || titleOrMessage;

        this.openModal(AlertModal, { title, message });
    }

    public confirm(message: string, options?: ConfirmOptions): Promise<boolean>;
    public confirm(title: string, message: string, options?: ConfirmOptions): Promise<boolean>;
    public confirm(
        titleOrMessage: string,
        messageOrOptions?: string | ConfirmOptions,
        options: ConfirmOptions = {},
    ): Promise<boolean> {
        options = typeof messageOrOptions === 'object' ? messageOrOptions : options;

        const title = typeof messageOrOptions === 'string' ? titleOrMessage : null;
        const message = typeof messageOrOptions === 'string' ? messageOrOptions : titleOrMessage;
        const modal = this.openModal<boolean>(ConfirmModal, { title, message, ...options }, { cancellable: false });

        return modal.result;
    }

    public async confirmMarkdown(file: string, options: Omit<ConfirmOptions, 'markdown'> = {}): Promise<boolean> {
        let title = null;
        let message = (await import(`@/assets/markdown/${file}.md`)).default;

        if (message.startsWith('# ')) {
            const secondLineIndex = message.indexOf('\n');

            title = message.substring(2, secondLineIndex);
            message = message.substring(secondLineIndex + 1);
        }

        return this.confirm(title, message, {
            markdown: true,
            ...options,
        });
    }

    public showError(error: any): void {
        Errors.handle(error);

        const { id: snackbarId } = this.showSnackbar(
            'Something went wrong, but it\'s not your fault. Try again!',
            {
                error: true,
                transient: true,
                lifetime: 10000,
                action: {
                    text: 'View details',
                    handler: () => {
                        this.hideSnackbar(snackbarId);
                        this.openModal(ErrorInfoModal, { error }, { cancellable: false });
                    },
                },
            },
        );
    }

    public showSnackbar(message: string, options: Partial<SnackbarOptions> = {}): Snackbar {
        const snackbar = {
            id: UUID.generate(),
            message,
            options: {
                loading: false,
                error: false,
                transient: false,
                ...options,
            },
        };

        this.setState({
            snackbars: [
                ...this.snackbars,
                snackbar,
            ],
        });

        return snackbar;
    }

    public updateSnackbar(id: string, message: string, options: Partial<SnackbarOptions> = {}): Snackbar | null {
        const index = this.snackbars.findIndex(snackbar => snackbar.id === id);

        if (index === -1)
            return null;

        const snackbar = this.snackbars[index];

        snackbar.message = message;
        Object.assign(snackbar.options, options);

        return snackbar;
    }

    public hideSnackbar(id: string): void {
        const index = this.snackbars.findIndex(snackbar => snackbar.id === id);

        if (index === -1)
            return;

        this.setState({ snackbars: Arr.withoutIndex(this.snackbars, index) });
    }

    public setAnimationsEnabled(enabled: boolean): void {
        if (this.animationsEnabled === enabled)
            return;

        this.setState({ animations: enabled });
        Storage.set(STORAGE_ANIMATIONS_KEY, enabled);
    }

    public async updateModel<Model extends SolidModel>(
        model: Model,
        update: (model: Model) => Promise<any> | any,
        affectedAttributes: string[] = [],
    ): Promise<void> {
        const operation = new AsyncOperation();
        const initialAttributes = Obj.only(model.getAttributes(), affectedAttributes);

        try {
            operation.start();

            await update(model);
            await model.save();

            operation.complete();
        } catch (error) {
            model.setAttributes(initialAttributes);

            operation.fail(error);
        }
    }

    public onClickAway(
        elementsOrIsAway: HTMLElement[] | ((target: HTMLElement) => boolean),
        callback: () => boolean | void,
    ): Function {
        const listener: ClickAwayListener = {
            isAway: Array.isArray(elementsOrIsAway)
                ? target => !elementsOrIsAway.find(element => element === target || element.contains(target))
                : elementsOrIsAway,
            callback,
        };

        this.updateClickAwayListeners([...this.clickAwayListeners, listener]);

        return () => this.updateClickAwayListeners(Arr.withoutItem(this.clickAwayListeners, listener));
    }

    public updateBootupProgressMessage(message: string): void {
        if (!this.bootupProgressMessage)
            return;

        this.bootupProgressMessage.textContent = message;
    }

    protected async boot(): Promise<void> {
        await super.boot();

        this.watchWindowMedia();
        this.watchAuth();
    }

    protected getInitialState(): State {
        return {
            layoutMediaQueries: {
                [Layout.Mobile]: true,
                [Layout.Desktop]: false,
            },
            headerHidden: false,
            menuOpen: false,
            modals: [],
            snackbars: [],
            animations: Storage.get(STORAGE_ANIMATIONS_KEY, true),
        };
    }

    protected getComputedStateDefinitions(): ComputedStateDefinitions<State, ComputedState> {
        return {
            layout({ layoutMediaQueries }: State): Layout {
                for (const [layout, active] of Object.entries(layoutMediaQueries).reverse()) {
                    if (!active)
                        continue;

                    return layout as Layout;
                }

                return Layout.Mobile;
            },
            mobile(_: State, { layout }: ComputedState): boolean {
                return layout === Layout.Mobile;
            },
            showOverlay({ modals, menuOpen }: State, { mobile }: ComputedState): boolean {
                return (mobile && menuOpen) || modals.length > 0;
            },
        };
    }

    private updateClickAwayListeners(listeners: ClickAwayListener[]) {
        this.clickAwayListeners = listeners;

        this.clickAwayListeners.length > 0
            ? this.startListeningClicks()
            : this.stopListeningClicks();
    }

    private startListeningClicks() {
        if (this.clickListener)
            return;

        document.addEventListener('click', this.clickListener = e => {
            const target = e.target as HTMLElement;

            for (const { isAway, callback } of this.clickAwayListeners) {
                if (!isAway(target))
                    continue;

                if (callback() === false)
                    continue;

                e.preventDefault();
                return;
            }
        });
    }

    private stopListeningClicks() {
        if (!this.clickListener)
            return;

        document.removeEventListener('click', this.clickListener);

        this.clickListener = null;
    }

    private watchWindowMedia() {
        for (const [layout, breakpoint] of Object.entries(screenBreakpoints)) {
            const media = window.matchMedia(`(min-width: ${breakpoint}px)`);
            const updateState = () => this.setState({
                layoutMediaQueries: {
                    ...this.state.layoutMediaQueries,
                    [layout]: media.matches,
                },
            });

            media.addEventListener('change', updateState);

            updateState();
        }
    }

    private watchAuth() {
        EventBus.on('logout', () => this.closeMenu());
    }

}
