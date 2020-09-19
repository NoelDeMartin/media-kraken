class Str {

    public capitalize(text: string): string {
        return text.substr(0, 1).toUpperCase() + text.substr(1);
    }

    public slug(text: string, separator: string = '-'): string {
        text = text
            .trim()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^\d\w\s]/g, '')
            .toLowerCase()
            .replace(/\s+/g, separator);

        if (separator.length > 0)
            text = text.replace(new RegExp(`${separator}+`, 'g'), separator);

        return text;
    }

    public contains(haystack: string, needle: string): boolean {
        return haystack.indexOf(needle) !== -1;
    }

    public studly(text: string): string {
        return text.split(/_|-|\s/)
            .map(
                word =>
                    word.length > 0
                        ? word.substr(0, 1).toUpperCase() + word.substr(1)
                        : word,
            )
            .join('');
    }

}

export default new Str();
