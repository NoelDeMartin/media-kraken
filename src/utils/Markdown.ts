import marked from 'marked';

const CODE_BLOCK = '```';

class Markdown {

    private renderer: marked.Renderer = new marked.Renderer();

    constructor() {
        this.renderer.link = function (href, title, text) {
            const link = marked.Renderer.prototype.link.apply(this, [href, title, text]);

            return link.replace('<a', '<a target="_blank"');
        };
    }

    public render(markdown: string): string {
        if (!markdown)
            return '';

        return marked(markdown, { renderer: this.renderer });
    }

    public codeBlock(code: string): string {
        return `${CODE_BLOCK}\n${code}\n${CODE_BLOCK}`;
    }

}

export default new Markdown();
