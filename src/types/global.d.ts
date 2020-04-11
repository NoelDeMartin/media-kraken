import '';

declare global {

    interface TestingRuntime {
        start(): Promise<void>;
        require<Module=any>(name: string): Module;
        service<K extends keyof Vue>(name: K): Vue[K];
    }

    interface Window {
        Runtime?: TestingRuntime;
    }

}
