import { compare, fail, range } from '@noeldemartin/utils';

interface DateComponentStats {
    min: number;
    max: number;
    average: number;
}

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
    const stats: DateComponentStats[] = range(3).map(() => ({
        min: Infinity,
        max: 0,
        average: 0,
    }));

    for (const date of dates) {
        const match = date.match(dateRegex);

        if (!match) {
            throw new Error('Unexpected date');
        }

        for (let i = 0; i < 3; i++) {
            const component = parseInt(match[i + 1] ?? '');
            const stat = stats[i]!;

            if (isNaN(component) || component === 0) {
                throw new Error('Unexpected date');
            }

            stat.min = Math.min(stat.min, component);
            stat.max = Math.max(stat.max, component);
            stat.average += component;
        }
    }

    range(3).forEach((i) => {
        const stat = stats[i]!;

        stat.average /= dates.length;
    });

    return [stats[0]!, stats[1]!, stats[2]!];
}

function findComponentIndex(
    componentStats: DateComponentStats[],
    min: number,
    max: number,
    exclude: number[] = [],
): number {
    const matching = range(componentStats.length)
        .filter((index) => {
            if (exclude.includes(index)) {
                return false;
            }

            const stats = componentStats[index];

            if (!stats) {
                return false;
            }

            return stats.min >= min && stats.max <= max;
        })
        .map((index) => {
            const stats = componentStats[index]!;

            return {
                index,
                variance: stats.max - stats.min,
            };
        });

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
        const year = parseInt(match?.groups?.year ?? '20' + format(match?.groups?.shortYear ?? '', 2));

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
        const yearStat = stats[yearIndex]!;

        names[yearIndex] = Math.ceil(yearStat.average).toString().length > 2 ? 'year' : 'shortYear';

        return new NetflixDateParser(
            new RegExp(
                `(?<${names[0]}>\\d+)${escapeRegexText(firstSeparator)}` +
                    `(?<${names[1]}>\\d+)${escapeRegexText(secondSeparator)}` +
                    `(?<${names[2]}>\\d+)`,
            ),
        );
    } catch {
        return null;
    }
}
