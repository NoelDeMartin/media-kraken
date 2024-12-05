import { compare, range } from '@noeldemartin/utils';

interface DateComponentStats {
    min: number;
    max: number;
    average: number;
}

// TODO remove when updating @noeldemartin/utils
function escapeRegexText(text: string): string {
    return text.replace(/[[\]{}()*+?.\\^$|]/g, '\\$&');
}

function getSeparators(date: string): [string?, string?] {
    const separatorsMatch = date.match(/\d+([^\d]+)\d+([^\d]+)\d+/);
    const firstSeparator = separatorsMatch?.[1];
    const secondSeparator = separatorsMatch?.[2];

    return [firstSeparator, secondSeparator];
}

function getComponentStats(
    firstSeparator: string,
    secondSeparator: string,
    dates: string[],
): [DateComponentStats, DateComponentStats, DateComponentStats] {
    const dateRegex = new RegExp(
        `(\\d+)${escapeRegexText(firstSeparator)}(\\d+)${escapeRegexText(secondSeparator)}(\\d+)`,
    );
    const stats = range(3).map(() => ({
        min: Infinity,
        max: 0,
        average: 0,
    }));

    for (const date of dates) {
        const match = date.match(dateRegex) ?? fail('Unexpected date');

        for (let i = 0; i < 3; i++) {
            const component = parseInt(match[i+1]);

            if (isNaN(component) || component === 0) {
                throw new Error('Unexpected date');
            }

            stats[i].min = Math.min(stats[i].min, component);
            stats[i].max = Math.max(stats[i].max, component);
            stats[i].average += component;
        }
    }

    range(3).forEach(i => (stats[i].average /= dates.length));

    return stats as [DateComponentStats, DateComponentStats, DateComponentStats];
}

function findComponentIndex(
    componentStats: DateComponentStats[],
    min: number,
    max: number,
    exclude: number[] = [],
): number {
    const matching = range(componentStats.length).filter((index) => {
        if (exclude.includes(index)) {
            return false;
        }

        const stats = componentStats[index];

        return stats.min >= min && stats.max <= max;
    }).map(index => ({
        index,
        variance: componentStats[index].max - componentStats[index].min,
    }));

    matching.sort((a, b) => compare(b.variance, a.variance));

    return matching[0]?.index ?? fail('Could not find component index');
}

export class NetflixDateParser {

    constructor(public regExp: RegExp) {}

    public parseDate(date: string): Date {
        const match = date.match(this.regExp);
        const format = (digit: number | string, length: number) => digit.toString().padStart(length, '0');
        const day = parseInt(match?.groups?.day ?? '');
        const month = parseInt(match?.groups?.month ?? '');
        const year = parseInt(match?.groups?.year ?? ('20' + format(match?.groups?.shortYear ?? '', 2)));

        return new Date(`${format(year, 4)}-${format(month, 2)}-${format(day, 2)}`);
    }

}

export function getNetflixDateParser(dates: string[]): NetflixDateParser | null {
    try {
        const [firstSeparator, secondSeparator] = getSeparators(dates[0] ?? '');

        if (!firstSeparator || !secondSeparator) {
            return null;
        }

        const stats = getComponentStats(firstSeparator, secondSeparator, dates);
        const dayIndex = findComponentIndex(stats, 1, 31);
        const monthIndex = findComponentIndex(stats, 1, 12, [dayIndex]);
        const yearIndex = findComponentIndex(stats, 0, Infinity, [dayIndex, monthIndex]);
        const names = range(3).map(() => '');

        names[dayIndex] = 'day';
        names[monthIndex] = 'month';
        names[yearIndex] = Math.ceil(stats[yearIndex].average).toString().length > 2 ? 'year' : 'shortYear';

        return new NetflixDateParser(
            new RegExp(
                `(?<${names[0]}>\\d+)${escapeRegexText(firstSeparator)}` +
                `(?<${names[1]}>\\d+)${escapeRegexText(secondSeparator)}` +
                `(?<${names[2]}>\\d+)`,
            ),
        );
    } catch (error) {
        return null;
    }
}
