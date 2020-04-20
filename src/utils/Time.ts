export interface DebouncedFunction<Args extends any[]> {
    (...args: Args): void;
    cancel(): void;
}

class Time {

    public debounce<Args extends any[]>(callback: (...args: Args) => any, delay: number): DebouncedFunction<Args> {
        let timeout: any;

        const debouncedCallback: DebouncedFunction<Args> = (...args: Args) => {
            debouncedCallback.cancel();
            timeout = setTimeout(() => callback(...args), delay);
        };

        debouncedCallback.cancel = () => clearTimeout(timeout);

        return debouncedCallback;
    }

    public isValidDateString(value: string): boolean {
        if (typeof value !== 'string')
            return false;

        const date = new Date(value);

        return !isNaN(date.getTime());
    }

    public wait(milliseconds: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, milliseconds));
    }

    public waitAnimationFrame(): Promise<void> {
        return new Promise(resolve => requestAnimationFrame(() => resolve()));
    }

}

export default new Time();
