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

class FilePicker {

    private input: HTMLInputElement;

    private activeUpload?: ActiveUpload;

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

        return new Promise<string>((resolve, reject) => {
            this.activeUpload!.resolve = resolve;
            this.activeUpload!.reject = reject;
        });
    }

    private onInputChanged(): void {
        if (!this.activeUpload || !this.input.files || this.input.files.length === 0)
            return;

        const reader = new FileReader();

        reader.onload = () => {
            if (!this.activeUpload)
                return;

            this.activeUpload.resolve!(reader.result as string);

            delete this.activeUpload;
        };

        reader.onerror = error => {
            if (!this.activeUpload)
                return;

            this.activeUpload.reject!(error);

            delete this.activeUpload;
        };

        switch(this.activeUpload.output) {
            case Output.Raw:
                reader.readAsText(this.input.files[0]);
                break;
        }
    }

}

export default new FilePicker();
