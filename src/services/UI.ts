import { Store } from 'vuex';

import Service from '@/services/Service';

interface State {
    layoutMediaQueries: {
        [layout in Layout]: boolean;
    },
    menuOpen: boolean;
}

enum Layout {
    Mobile = 'mobile',
    Desktop = 'desktop',
}

const screenBreakpoints: { [layout in Layout]?: number } = {
    [Layout.Desktop]: 640,
};

export default class UI extends Service {

    private mobileMenu: HTMLElement | null = null;
    private desktopMenu: HTMLElement | null = null;
    private menuTriggers: HTMLButtonElement[] = [];

    private clickListener: EventListener | null = null;

    public get layout(): Layout {
        return this.app.$store.getters.activeLayout;
    }

    public get mobile(): boolean {
        return this.layout === Layout.Mobile;
    }

    public get desktop(): boolean {
        return this.layout === Layout.Desktop;
    }

    public get menuOpen(): boolean {
        return this.app.$store.state.ui.menuOpen;
    }

    private get menu(): HTMLElement | null {
        return this.app.$ui.mobile ? this.mobileMenu : this.desktopMenu;
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

    public toggleMenu() {
        if (!this.menu)
            return;

        const menuOpen = !this.menuOpen;

        this.app.$store.commit('setMenuOpen', menuOpen);

        menuOpen ? this.startListeningClicks() : this.stopListeningClicks();
    }

    public closeMenu() {
        if (!this.menuOpen)
            return;

        this.toggleMenu();
    }

    protected async init(): Promise<void> {
        await super.init();

        for (const [layout, breakpoint] of Object.entries(screenBreakpoints)) {
            const media = window.matchMedia(`(min-width: ${breakpoint}px)`);

            this.app.$store.commit('setLayoutMediaQuery', { layout, active: media.matches });

            media.addListener(media => this.app.$store.commit('setLayoutMediaQuery', { layout, active: media.matches }));
        }
    }

    protected registerStoreModule(store: Store<State>): void {
        store.registerModule('ui', {
            state: {
                layoutMediaQueries: {
                    [Layout.Mobile]: true,
                    [Layout.Desktop]: false,
                },
                menuOpen: false,
            },
            mutations: {
                setLayoutMediaQuery(
                    state: State,
                    { layout, active }: {layout: Layout, active: boolean },
                ) {
                    state.layoutMediaQueries[layout] = active;
                },
                setMenuOpen(state: State, menuOpen: boolean) {
                    state.menuOpen = menuOpen;
                },
            },
            getters: {
                activeLayout({ layoutMediaQueries }: State): Layout {
                    for (const [layout, active] of Object.entries(layoutMediaQueries).reverse()) {
                        if (!active)
                            continue;

                        return layout as Layout;
                    }

                    return Layout.Mobile;
                },
            },
        });
    }

    private startListeningClicks() {
        if (this.clickListener)
            return;

        document.addEventListener('click', this.clickListener = e => {
            const target = e.target as HTMLElement;

            if (
                target === this.menu ||
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
