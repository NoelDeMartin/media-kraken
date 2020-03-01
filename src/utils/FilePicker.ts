const enum Output {
    Raw = 'raw',
}

interface ActiveUpload {
    output: Output;
    resolve?(result: string): void;
    reject?(error?: any): void;
}

interface UploadConfig {
    output?: Output;
    accept?: string;
}

const BODY_CANCEL_EVENTS = ['focus', 'mousemove', 'touchmove'];

class FilePicker {

    private input: HTMLInputElement;

    private activeUpload?: ActiveUpload;

    private cancelActiveUpload = () => {
        if (!this.activeUpload)
            return;

        BODY_CANCEL_EVENTS.map(
            event => document.body.removeEventListener(event, this.cancelActiveUpload),
        );

        setTimeout(() => delete this.activeUpload, 200);
    }

    constructor() {
        this.input = document.createElement('input');
        this.input.setAttribute('type', 'file');
        this.input.onchange = () => this.onInputChanged();
    }

    public upload(config: UploadConfig = {}): Promise<string> {
        if (this.activeUpload)
            return Promise.reject('FileInput is already processing an upload');

        const promise = this.initializeActiveUpload(config.output);

        this.input.setAttribute('accept', config.accept || '*');
        this.input.click();

        return promise;
    }

    private initializeActiveUpload(output: Output = Output.Raw): Promise<string> {
        this.activeUpload = { output };

        BODY_CANCEL_EVENTS.map(
            event => document.body.addEventListener(event, this.cancelActiveUpload),
        );

        return new Promise<string>((resolve, reject) => {
            this.activeUpload!.resolve = resolve;
            this.activeUpload!.reject = reject;
        });
    }

    private onInputChanged(): void {
        if (!this.activeUpload || !this.input.files || this.input.files.length === 0)
            return;

        const reader = new FileReader();
        const activeUpload = this.activeUpload;

        delete this.activeUpload;

        reader.onload = () => {
            if (!activeUpload)
                return;

            activeUpload.resolve!(reader.result as string);
        };

        reader.onerror = error => {
            if (!activeUpload)
                return;

            activeUpload.reject!(error);
        };

        switch(activeUpload.output) {
            case Output.Raw:
                reader.readAsText(this.input.files[0]);
                break;
        }
    }

}

export default new FilePicker();
