import Time from '@/utils/Time';

export const enum Format {
    Raw = 'raw',
}

export const enum MediaType {
    JSON = 'application/json',
    CSV = 'text/csv',
}

interface ActiveUpload {
    output: Format;
    resolve?(result: UploadResult): void;
    reject?(error?: any): void;
}

interface UploadConfig {
    output?: Format;
    accept?: MediaType;
}

type UploadResult = string | null;

const BODY_CANCEL_EVENTS = ['focus', 'mousemove', 'touchmove'];

const MEDIA_TYPES_ACCEPT = {
    [MediaType.JSON]: '.json',
    [MediaType.CSV]: '.csv',
};

class Files {

    private input!: HTMLInputElement;
    private activeUpload?: ActiveUpload;

    private cancelActiveUpload = async () => {
        if (!this.activeUpload)
            return;

        BODY_CANCEL_EVENTS.map(
            event => document.body.removeEventListener(event, this.cancelActiveUpload),
        );

        this.activeUpload.resolve!(null);
        delete this.activeUpload;
    }

    public setInput(input: HTMLInputElement): void {
        this.input = input;
        this.input.onchange = () => this.onInputChanged();
    }

    public upload(config: UploadConfig = {}): Promise<UploadResult> {
        if (this.activeUpload)
            return Promise.reject('FileInput is already processing an upload');

        this.input.setAttribute('value', '');
        this.input.setAttribute('accept', MEDIA_TYPES_ACCEPT[config.accept!] || '*');

        const promise = this.initializeActiveUpload(config.output);

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

    private initializeActiveUpload(output: Format = Format.Raw): Promise<UploadResult> {
        this.activeUpload = { output };

        // Make sure this doesn't start listening before the file picker modal opens
        Time.wait(200)
            .then(() => BODY_CANCEL_EVENTS.map(event => this.registerCancelUploadListener(event)));

        return new Promise<UploadResult>((resolve, reject) => {
            this.activeUpload!.resolve = resolve;
            this.activeUpload!.reject = reject;
        });
    }

    private registerCancelUploadListener(event: string): void {
        document.body.addEventListener(event, this.cancelActiveUpload);
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
