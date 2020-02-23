class UUID {

    // Obtained from https://gist.github.com/jed/982883
    public generate(placeholder?: any): string {
        return placeholder
            ? (placeholder ^ Math.random() * 16 >> placeholder / 4).toString(16)
            : ('' + 1e7 + -1e3 + -4e3 + -8e3 + -1e11)
                .replace(/[018]/g, this.generate);
    }

}

export default new UUID();
