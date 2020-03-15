import { Component } from 'vue';

import Service, { ComputedStateDefinitions } from '@/services/Service';

import UUID from '@/utils/UUID';

import LoadingMessage from '@/modals/LoadingMessage.vue';

enum Layout {
    Mobile = 'mobile',
    Desktop = 'desktop',
}

interface Modal {
    id: string;
    component: Component;
    options: ModalOptions;
    props: object;
}

interface ModalOptions {
    cancellable: boolean;
}

interface State {
    layoutMediaQueries: {
        [layout in Layout]: boolean;
    },
    menuOpen: boolean;
    modals: Modal[];
}

interface ComputedState {
    layout: Layout;
}

const screenBreakpoints: { [layout in Layout]?: number } = {
    [Layout.Desktop]: 640,
};

export default class UI extends Service<State, ComputedState> {

    private mobileMenu: HTMLElement | null = null;
    private desktopMenu: HTMLElement | null = null;
    private menuTriggers: HTMLButtonElement[] = [];

    private clickListener: EventListener | null = null;

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

    public get modals(): Modal[] {
        return this.state.modals;
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

    public async loading<T>(callback: () => Promise<T>, message?: string): Promise<T> {
        const modal = await this.openModal(LoadingMessage, { message }, { cancellable: false });

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

        menuOpen ? this.startListeningClicks() : this.stopListeningClicks();
    }

    public closeMenu() {
        if (!this.menuOpen)
            return;

        this.toggleMenu();
    }

    public openModal(component: Component, props: object = {}, options: Partial<ModalOptions> = {}): Modal {
        const id = UUID.generate();
        const modal = {
            id,
            component,
            options: {
                cancellable: true,
                ...options,
            },
            props: {
                ...props,
                id,
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

        this.setState({
            modals: [
                ...this.modals.slice(0, index),
                ...this.modals.slice(index + 1),
            ],
        });
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

    private startListeningClicks() {
        if (this.clickListener)
            return;

        document.addEventListener('click', this.clickListener = e => {
            const target = e.target as HTMLElement;

            if (
                this.menu === target ||
                this.menu!.contains(target) ||
                this.menuTriggers.find(button => target === button || button.contains(target))
            )
                return;

            this.toggleMenu();
        });
    }

    private stopListeningClicks() {
        if (!this.clickListener)
            return;

        document.removeEventListener('click', this.clickListener);

        this.clickListener = null;
    }

}
