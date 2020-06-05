import { Engine, IndexedDBEngine } from 'soukai';

import { AppLibraries } from '@/types/global';

import Http from '@tests/utils/Http';
import TestingEngine from '@tests/engines/TestingEngine';

interface Config {
    useRealEngines?: boolean;
}

const fetchRoutes: { urlPattern: RegExp; response: any }[] = [];

function getRuntime(): Cypress.Chainable<TestingRuntime> {
    return cy.window().its('Runtime').then(runtime => runtime!);
}

function setupTestingEngine(): void {
    getRuntime().then(runtime => {
        const Soukai = runtime.lib('soukai');
        const idbEngine = new IndexedDBEngine('media-kraken');
        const engine = new TestingEngine(idbEngine);

        idbEngine.purgeDatabase();

        Soukai.useEngine(engine);

        cy.wrap(engine).as('soukaiEngine');
    });
}

export function fetchStub(url: string): Promise<Response> {
    const match = fetchRoutes.find(route => route.urlPattern.test(url));
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

    start(config: Config = {}): void {
        cy.wrap(config).as('config');
        cy.window()
          .then(window => cy.stub(window, 'fetch', fetchStub));
        cy.lib('solid-auth-client')
          .then(SolidAuthClient => cy.stub(SolidAuthClient, 'fetch', fetchStub));

        if (!config.useRealEngines)
            setupTestingEngine();

        getRuntime().then(runtime => runtime.start());
    },

    restart(): void {
        cy.reload();
        cy.get<Config>('@config').then(config => cy.start(config));
    },

    resetIndexedDB(): void {
        (new IndexedDBEngine('media-kraken')).purgeDatabase();
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

    lib<K extends keyof AppLibraries>(name: K): Cypress.Chainable<AppLibraries[K]> {
        return getRuntime().then(runtime => runtime.lib(name));
    },

    login(): void {
        getRuntime().then(runtime => {
            const user = runtime.login();

            cy.wrap(user).as('user');
        });
    },

    spyEngine(): void {
        cy.get<Engine>('@soukaiEngine').then(engine => {
            cy.wrap({
                create: cy.spy(engine, 'create'),
                readOne: cy.spy(engine, 'readOne'),
                readMany: cy.spy(engine, 'readMany'),
                update: cy.spy(engine, 'update'),
                delete: cy.spy(engine, 'delete'),
            }).as('soukaiEngineSpies');
        });
    },

    engineSpiesExpectations(
        expectations: { [method in keyof Engine]?: (spy: Cypress.Agent<sinon.SinonSpy>) => void },
    ): void {
        cy.get('@soukaiEngineSpies').then(spies => {
            for (const method in spies) {
                const spy = spies[method] as any as Cypress.Agent<sinon.SinonSpy>;

                if (method in expectations) {
                    expectations[method as keyof Engine]!(spy);
                } else {
                    expect(spy).to.not.have.been.called;
                }
            }
        });
    },

    fetchRoute(urlPattern: RegExp | string, response: Response | any): void {
        if (!(urlPattern instanceof RegExp))
            urlPattern = new RegExp(urlPattern);

        fetchRoutes.push({ urlPattern, response });
    },

    see(text: string): void {
        cy.contains(text).should('be.visible');
    },

    seeImage(url: string): void {
        cy.get<HTMLElement>(`img[src="${url}"]`).should('be.visible');
    },

    ariaLabel(label: string): Cypress.Chainable<JQuery<HTMLElement>> {
        return cy.get<HTMLElement>(`[aria-label="${label}"]`);
    },

    ariaRole(role: string): Cypress.Chainable<JQuery<HTMLElement>> {
        return cy.get<HTMLElement>(`[role="${role}"]`);
    },

};

for (const command in customCommands) {
    Cypress.Commands.add(command, (customCommands as any)[command]);
}

export default customCommands;
