const NON_WRITABLE_INPUT_TYPES = ['submit', 'reset', 'checkbox', 'radio'];

class DOM {

    public isWritable(element: any): boolean {
        if (!(element instanceof HTMLElement))
            return false;

        const name = element.nodeName.toLowerCase();

        return name === 'select'
            || (
                name === 'input' &&
                !NON_WRITABLE_INPUT_TYPES.includes((element.getAttribute('type') || 'text').toLowerCase())
            )
            || name === 'textarea'
            || element.isContentEditable;
    }

    public measurePixels(css: string, parent?: Element): number {
        const ruler = document.createElement('div');
        ruler.style.position = 'fixed';
        ruler.style.width = css;

        (parent || document.body).append(ruler);

        const size = ruler.clientWidth;

        ruler.remove();

        return size;
    }

}

export default new DOM();
