class Time {

    public isValidDateString(value: string): boolean {
        const date = new Date(value);

        return isNaN(date.getTime());
    }

}

export default new Time();
