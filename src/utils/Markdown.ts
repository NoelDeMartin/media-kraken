import marked from 'marked';

class Markdown {

    private renderer: marked.Renderer = new marked.Renderer();

    public constructor() {
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

}

export default new Markdown();
