class Str {

    public capitalize(text: string): string {
        return text.substr(0, 1).toUpperCase() + text.substr(1);
    }

    public camel(str: string): string {
        return str.split(/_|-|\s|(?=[A-Z])/)
            .map(
                (word, index) => {
                    if (word.length === 0) {
                        return word;
                    }

                    if (index === 0) {
                        return word.toLowerCase();
                    }

                    return word.substr(0, 1).toUpperCase() + word.substr(1).toLowerCase();
                },
            )
            .join('');
    }

    public parseVersion(version: string): [number, number, number, string?] | null {
        const matches = version.match(/(\d+)\.(\d+)\.(\d+)(-(.*))?/);

        if (!matches)
            return null;

        return matches[5]
            ? [parseInt(matches[1]), parseInt(matches[2]), parseInt(matches[3]), matches[5]]
            : [parseInt(matches[1]), parseInt(matches[2]), parseInt(matches[3])];
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
