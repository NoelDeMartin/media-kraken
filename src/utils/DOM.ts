class DOM {

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
