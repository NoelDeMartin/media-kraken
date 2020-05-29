import { Engine, EngineDocument, EngineFilters, EngineDocumentsCollection, EngineUpdates } from 'soukai';

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

    public async create(collection: string, document: EngineDocumentsCollection, id?: string): Promise<string> {
        await this.executeModifications();

        return this.engine.create(collection, document, id);
    }

    public async readOne(collection: string, id: string): Promise<EngineDocument> {
        await this.executeModifications();

        return this.engine.readOne(collection, id);
    }

    public async readMany(collection: string, filters?: EngineFilters): Promise<EngineDocumentsCollection> {
        await this.executeModifications();

        return this.engine.readMany(collection, filters);
    }

    public async update(collection: string, id: string, updates: EngineUpdates): Promise<void> {
        await this.executeModifications();

        return this.engine.update(collection, id, updates);
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
