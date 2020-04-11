export interface DebouncedFunction {
    call(...args: any[]): void;
    resolve(...args: any[]): void;
    cancel(): void;
}

class Time {

    public debounce(callback: Function, delay: number): DebouncedFunction {
        let timeout: any | null = null;

        return {
            call(...args: any[]) {
                this.cancel();

                timeout = setTimeout(() => this.resolve(...args), delay);
            },
            resolve(...args: any[]) {
                timeout = null;

                callback(...args);
            },
            cancel() {
                if (timeout === null)
                    return;

                clearTimeout(timeout);
                timeout = null;
            },
        };
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

}

export default new Time();
