/// <reference types="cypress" />

import commands from '@cy/support/commands';

type CustomCommands<Subject> = {
    [command in keyof typeof commands]: typeof commands[command];
};

declare global {

    namespace Cypress {

        // eslint-disable-next-line @typescript-eslint/no-empty-interface
        interface Chainable<Subject> extends CustomCommands<Subject> {
            reload(optionsOrForceReload?: Partial<StartAppOptions> | boolean): Chainable<AUTWindow>;
        }

    }

}
