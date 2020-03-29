export const enum Format {
    Raw = 'raw',
}

export const enum MediaType {
    JSON = 'application/json',
}

interface ActiveUpload {
    output: Format;
    resolve?(result: string): void;
    reject?(error?: any): void;
}

interface UploadConfig {
    output?: Format;
    accept?: MediaType;
}

const BODY_CANCEL_EVENTS = ['focus', 'mousemove', 'touchmove'];

const MEDIA_TYPES_ACCEPT = {
    [MediaType.JSON]: '.json',
};

class Files {

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

        this.input.setAttribute('accept', MEDIA_TYPES_ACCEPT[config.accept!] || '*');
        this.input.click();

        return promise;
    }

    public download(filename: string, content: string, mediaType: MediaType = MediaType.JSON) {
        const url = window.URL.createObjectURL(new Blob([content], {type: mediaType}));
        const anchor = document.createElement('a');

        anchor.style.display = 'none';
        anchor.href = url;
        anchor.download = filename;
        document.body.appendChild(anchor);
        anchor.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(anchor);
    }

    private initializeActiveUpload(output: Format = Format.Raw): Promise<string> {
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
            case Format.Raw:
                reader.readAsText(this.input.files[0]);
                break;
        }
    }

}

export default new Files();
