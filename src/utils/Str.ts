class Str {

    public slug(text: string): string {
        return text
            .replace(/[^\d\w]/g, '-')
            .replace(/-+/g, '-')
            .toLowerCase();
    }

}

export default new Str();
