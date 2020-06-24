import { IndexedDBEngine } from 'soukai';

import { AppLibraries } from '@/types/global';

import ModelsCache from '@/models/ModelsCache';

import Http from '@tests/utils/Http';

const fetchRoutes: { match(url: string): boolean; response: any }[] = [];

function getRuntime(): Cypress.Chainable<TestingRuntime> {
    return cy.window().its('Runtime').then(runtime => runtime!);
}

export function fetchStub(url: string): Promise<Response> {
    const match = fetchRoutes.find(route => route.match(url));
    const response = match?.response;

    if (typeof response === 'string')
        return Promise.resolve(Http.success(response));

    if (Http.isResponse(response))
        return Promise.resolve(response);

    if (typeof response === 'object')
        return Promise.resolve(Http.success(JSON.stringify(response)));

    return Promise.resolve(Http.notFound());
}

const customCommands = {

    startApp(): void {
        cy.window()
          .then(window => cy.stub(window, 'fetch', fetchStub));
        cy.lib('solid-auth-client')
          .then(SolidAuthClient => cy.stub(SolidAuthClient, 'fetch', fetchStub));

        getRuntime().then(runtime => runtime.start());
    },

    login(): void {
        getRuntime().then(runtime => runtime.login());
    },

    resetBrowser(): void {
        fetchRoutes.length = 0;
        ModelsCache.clear();
        (new IndexedDBEngine('media-kraken')).purgeDatabase();
        cy.window().then(window => window.Runtime?.lib('soukai').closeConnections());
    },

    lib<K extends keyof AppLibraries>(name: K): Cypress.Chainable<AppLibraries[K]> {
        return getRuntime().then(runtime => runtime.lib(name));
    },

    addMovie(jsonld: object): void {
        getRuntime().then(runtime => runtime.addMovie(jsonld));
    },

    indexedDBShouldBeEmpty() {
        const databaseExists = (database: string): { exists: boolean | null } => {
            const request = indexedDB.open(database);
            const result: { exists: boolean | null } = { exists: null };

            request.onsuccess = function () {
                request.result.close();

                if (result.exists === null)
                    result.exists = true;

                if (!result.exists)
                    indexedDB.deleteDatabase(database);
            };
            request.onupgradeneeded = function () {
                result.exists = false;
            };

            return result;
        };

        cy
            .wrap([
                databaseExists('soukai-media-kraken'),
                databaseExists('soukai-media-kraken-meta'),
            ])
            .should(([data, metadata]) => {
                expect(data.exists).to.be.false;
                expect(metadata.exists).to.be.false;
            });
    },

    localStorageShouldBeEmpty() {
        cy.wrap(null).should(() => {
            expect(localStorage.getItem('offline-user')).to.be.null;
            expect(localStorage.getItem('solid-auth-client')).to.be.null;
        });
    },

    fetchRoute(pattern: RegExp | string, response: Response | any): void {
        fetchRoutes.push({
            match(url) {
                return pattern instanceof RegExp
                    ? pattern.test(url)
                    : url.indexOf(pattern) !== -1;
            },
            response,
        });
    },

    see(text: string): void {
        cy.contains(text).should('be.visible');
    },

    seeImage(url: string, options: Partial<Cypress.Timeoutable> = {}): void {
        cy.get<HTMLElement>(`img[src="${url}"]`, options).should('be.visible');
    },

    ariaLabel(label: string): Cypress.Chainable<JQuery<HTMLElement>> {
        return cy.get<HTMLElement>(`[aria-label="${label}"]`);
    },

    ariaRole(role: string): Cypress.Chainable<JQuery<HTMLElement>> {
        return cy.get<HTMLElement>(`[role="${role}"]`);
    },

    buttonWithTitle(title: string): Cypress.Chainable<JQuery<HTMLElement>> {
        return cy.get<HTMLElement>(`button[title="${title}"]`);
    },

    anchorWithTitle(title: string): Cypress.Chainable<JQuery<HTMLElement>> {
        return cy.get<HTMLElement>(`a[title="${title}"]`);
    },

    uploadFixture(name: string): void {
        let blob: Blob;

        cy.fixture(name)
            .then(content => {
                return Cypress.Blob.base64StringToBlob(
                    btoa(JSON.stringify(content)),
                    'application/json',
                );
            })
            .then(b => blob = b);

        cy.get<HTMLInputElement>('#file-picker').then(input => {
            const file = new File([blob], name);
            const dataTransfer = new DataTransfer();

            dataTransfer.items.add(file);

            input[0].files = dataTransfer.files;
            input.trigger('change', { force: true });
        });
    },

};

for (const command in customCommands) {
    Cypress.Commands.add(command, (customCommands as any)[command]);
}

Cypress.Commands.overwrite('reload', originalReload => {
    originalReload();
    cy.startApp();
});

export default customCommands;
