import { Engine, InMemoryEngine, LocalStorageEngine } from 'soukai';

import { AppLibraries } from '@/types/global';

import StubResponse from '@tests/stubs/StubResponse';
import TestingEngine from '@tests/engines/TestingEngine';

interface Config {
    persistSessions?: boolean;
    useRealEngines?: boolean;
}

const fetchRoutes: { urlPattern: RegExp; response: any }[] = [];

function getRuntime(): Cypress.Chainable<TestingRuntime> {
    return cy.window().its('Runtime').then(runtime => runtime!);
}

function setupTestingEngine(config: Config): void {
    getRuntime().then(runtime => {
        const Soukai = runtime.lib('soukai');
        const engine = new TestingEngine(
            config.persistSessions
                ? new LocalStorageEngine('media-kraken')
                : new InMemoryEngine,
        );

        Soukai.useEngine(engine);

        cy.wrap(engine).as('soukaiEngine');
    });
}

export function fetchStub(url: string): Promise<Response> {
    const match = fetchRoutes.find(route => route.urlPattern.test(url));

    return Promise.resolve(match?.response || StubResponse.notFound());
}

const customCommands = {

    start(config: Config = {}): void {
        cy.wrap(config).as('config');
        cy.window()
          .then(window => cy.stub(window, 'fetch', fetchStub));
        cy.lib('solid-auth-client')
          .then(SolidAuthClient => cy.stub(SolidAuthClient, 'fetch', fetchStub));

        if (!config.useRealEngines)
            setupTestingEngine(config);

        getRuntime().then(runtime => runtime.start());
    },

    restart(): void {
        cy.reload();
        cy.get<Config>('@config').then(config => cy.start(config));
    },

    lib<K extends keyof AppLibraries>(name: K): Cypress.Chainable<AppLibraries[K]> {
        return getRuntime().then(runtime => runtime.lib(name));
    },

    login(): void {
        cy.get<Config>('@config').then(config => {
            getRuntime().then(runtime => {
                const user = runtime.login('Cypress', config.persistSessions);

                cy.wrap(user).as('user');
            });
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

        if (typeof response === 'string')
            response = StubResponse.success(response);

        if (!StubResponse.isResponse(response))
            response = StubResponse.success(JSON.stringify(response));

        fetchRoutes.push({ urlPattern, response });
    },

    see(text: string): void {
        cy.contains(text).should('be.visible');
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
