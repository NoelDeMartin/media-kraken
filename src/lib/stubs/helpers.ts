export type StubDefinition<TLabel extends string = string, TValue = unknown> = [TLabel, TValue][];

export function defineStub<const T extends StubDefinition>(options: T) {
    return {
        first: options[0]?.[0],
        all: options.map(([_, value]) => value) as T[number][1][],
        control: {
            control: { type: 'select' as const },
            options: options.map(([label]) => label) as T[number][0][],
        },
        resolve(value: T[number][0]) {
            return options.find(([label]) => label === value)?.[1] as T[number][1];
        },
    };
}
