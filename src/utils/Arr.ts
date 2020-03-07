class Arr {

    public contains<T>(arr: T[], item: T): boolean {
        return arr.indexOf(item) !== -1;
    }

    public unique<T>(arr: T[]): T[] {
        return arr.filter((item, index) => arr.indexOf(item) === index);
    }

}

export default new Arr();
