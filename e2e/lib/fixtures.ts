import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { applyReplacements, Replacements, required } from '@noeldemartin/utils';

export function requiredFixture(path: string, replacements?: Replacements) {
    return required(fixture(path, replacements), `Fixture '${path}' not found`);
}

export function fixture(path: string, replacements?: Replacements) {
    path = path.startsWith('/') ? path.slice(1) : path;

    const fixturePath = resolve(import.meta.dirname, '../fixtures', path);

    if (!existsSync(fixturePath)) {
        return null;
    }

    return replacements
        ? applyReplacements(readFileSync(fixturePath, 'utf-8'), replacements)
        : readFileSync(fixturePath, 'utf-8');
}
