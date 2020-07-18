class Arr {

    public contains<T>(arr: T[], item: T): boolean {
        return arr.indexOf(item) !== -1;
    }

    public removeItem<T>(items: T[], item: T): T {
        const index = items.indexOf(item);

        if (index !== -1)
            items.splice(index, 1);

        return item;
    }

    public unique<T>(arr: T[]): T[] {
        return arr.filter((item, index) => arr.indexOf(item) === index);
    }

    public withoutItem<T>(arr: T[], item: T): T[] {
        const index = arr.indexOf(item);

        return index !== -1 ? this.withoutIndex(arr, index) : arr;
    }

    public withoutIndex<T>(arr: T[], index: number): T[] {
        return [...arr.slice(0, index), ...arr.slice(index + 1)];
    }

}

export default new Arr();
