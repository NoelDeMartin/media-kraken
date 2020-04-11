import { Engine, EngineAttributes, Filters, Documents } from 'soukai';

import Time from '@/utils/Time';

export default class TestingEngine implements Engine {

    private engine: Engine;
    private error?: Error;
    private delay?: number;

    constructor(engine: Engine) {
        this.engine = engine;
    }

    public setError(error: Error): void {
        this.error = error;
    }

    public setDelay(delay: number): void {
        this.delay = delay;
    }

    public async create(collection: string, attributes: EngineAttributes, id?: string): Promise<string> {
        await this.executeModifications();

        return this.engine.create(collection, attributes, id);
    }

    public async readOne(collection: string, id: string): Promise<EngineAttributes> {
        await this.executeModifications();

        return this.engine.readOne(collection, id);
    }

    public async readMany(collection: string, filters?: Filters): Promise<Documents> {
        await this.executeModifications();

        return this.engine.readMany(collection, filters);
    }

    public async update(
        collection: string,
        id: string,
        updatedAttributes: EngineAttributes,
        removedAttributes: string[],
    ): Promise<void> {
        await this.executeModifications();

        return this.engine.update(collection, id, updatedAttributes, removedAttributes);
    }

    public async delete(collection: string, id: string): Promise<void> {
        await this.executeModifications();

        return this.engine.delete(collection, id);
    }

    private async executeModifications(): Promise<void> {
        await this.waitForDelay();

        this.throwError();
    }

    private throwError(): void {
        if (!this.error)
            return;

        throw this.error;
    }

    private async waitForDelay(): Promise<void> {
        if (!this.delay)
            return;

        await Time.wait(this.delay);
    }

}
