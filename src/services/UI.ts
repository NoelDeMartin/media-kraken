import { Component } from 'vue';
import { SolidModel } from 'soukai-solid';

import Service, { ComputedStateDefinitions } from '@/services/Service';

import Arr from '@/utils/Arr';
import AsyncOperation from '@/utils/AsyncOperation';
import UUID from '@/utils/UUID';

import LoadingModal from '@/components/modals/LoadingModal.vue';
import MarkdownModal from '@/components/modals/MarkdownModal.vue';

enum Layout {
    Mobile = 'mobile',
    Desktop = 'desktop',
}

interface State {
    layoutMediaQueries: {
        [layout in Layout]: boolean;
    },
    menuOpen: boolean;
    modals: Modal[];
    snackbars: Snackbar[];
}

interface ComputedState {
    layout: Layout;
}

interface ClickAwayListener {
    isAway(target: HTMLElement): boolean;
    callback(): void | boolean;
}

const screenBreakpoints: { [layout in Layout]?: number } = {
    [Layout.Desktop]: 640,
};

export interface Modal {
    id: string;
    component: Component;
    options: ModalOptions;
    props: object;
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
}

export default class UI extends Service<State, ComputedState> {

    private mobileMenu: HTMLElement | null = null;
    private desktopMenu: HTMLElement | null = null;
    private menuTriggers: HTMLButtonElement[] = [];
    private myCollection: HTMLElement | null = null;

    private clickListener: EventListener | null = null;
    private removeMenuClickAwayListener: Function | null = null;
    private clickAwayListeners: ClickAwayListener[] = [];

    public get layout(): Layout {
        return this.computedState.layout;
    }

    public get mobile(): boolean {
        return this.layout === Layout.Mobile;
    }

    public get desktop(): boolean {
        return this.layout === Layout.Desktop;
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

    public get showOverlay(): boolean {
        return (this.mobile && this.menuOpen)
            || this.modals.length > 0;
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

    public toggleMenu() {
        if (!this.menu)
            return;

        const menuOpen = !this.menuOpen;

        this.setState({ menuOpen });

        if (this.removeMenuClickAwayListener) {
            this.removeMenuClickAwayListener();
            this.removeMenuClickAwayListener = null;
            return;
        }

        this.removeMenuClickAwayListener = this.onClickAway(
            target => (
                this.menu !== target &&
                !this.menu!.contains(target) &&
                !this.menuTriggers.find(trigger => target === trigger || trigger.contains(target))
            ),
            () => this.toggleMenu(),
        );
    }

    public closeMenu() {
        if (!this.menuOpen)
            return;

        this.toggleMenu();
    }

    public openMarkdownModal(content: string, replacements: any = {}): void {
        this.openModal(MarkdownModal, { content, replacements });
    }

    public openModal(component: Component, props: object = {}, partialOptions: Partial<ModalOptions> = {}): Modal {
        const id = UUID.generate();
        const options = {
            cancellable: true,
            ...partialOptions,
        };
        const modal = {
            id,
            options,
            component,
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

        this.setState({ modals: Arr.withoutIndex(this.modals, index) });
    }

    public showError(error: any): void {
        this.showSnackbar('Something went wrong!', { error: true, transient: true });

        console.error(error);
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

    async updateModel<Model extends SolidModel>(
        model: Model,
        update: (model: Model) => Promise<any> | any,
        affectedAttributes: string[] = [],
    ): Promise<void> {
        const operation = new AsyncOperation();
        const initialAttributes = affectedAttributes.map(attribute => model.getAttribute(attribute));

        try {
            operation.start();

            await update(model);
            await model.save();

            operation.complete();
        } catch (error) {
            operation.fail(error);

            // TODO implement model.setAttributes(...); in soukai
            affectedAttributes.forEach((attribute, index) => {
                model.setAttribute(attribute, initialAttributes[index]);
            });
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

    protected async init(): Promise<void> {
        await super.init();

        for (const [layout, breakpoint] of Object.entries(screenBreakpoints)) {
            const media = window.matchMedia(`(min-width: ${breakpoint}px)`);
            const updateState = () => this.setState({
                layoutMediaQueries: {
                    ...this.state.layoutMediaQueries,
                    [layout]: media.matches,
                },
            });

            media.addListener(updateState);

            updateState();
        }
    }

    protected getInitialState(): State {
        return {
            layoutMediaQueries: {
                [Layout.Mobile]: true,
                [Layout.Desktop]: false,
            },
            menuOpen: false,
            modals: [],
            snackbars: [],
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

}
