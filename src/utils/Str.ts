class Str {

    public slug(text: string): string {
        return text
            .replace(/[^\d\w]/g, '-')
            .replace(/-+/g, '-')
            .toLowerCase();
    }

    public contains(haystack: string, needle: string): boolean {
        return haystack.indexOf(needle) !== -1;
    }

}

export default new Str();
