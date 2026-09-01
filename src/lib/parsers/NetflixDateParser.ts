import { escapeRegexText, range } from '@noeldemartin/utils';
import type { Nullable } from '@noeldemartin/utils';

interface DateComponentStats {
    min: number;
    max: number;
    average: number;
    variance: number;
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
        variance: 0,
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
        stat.variance = stat.max - stat.min;
    });

    return [stats[0]!, stats[1]!, stats[2]!];
}

export default class NetflixDateParser {
    static fromDates(dates: string[]): NetflixDateParser | null {
        try {
            const [firstSeparator, secondSeparator] = getSeparators(dates[0] ?? '');

            if (!firstSeparator || !secondSeparator) {
                return null;
            }

            const stats = getComponentStats(firstSeparator, secondSeparator, dates);

            let yearIndex: number;

            if (stats[0].max > 31) {
                if (stats[2].max > 31) {
                    return null;
                }

                yearIndex = 0;
            } else if (stats[2].max > 31) {
                yearIndex = 2;
            } else if (firstSeparator === '-' && stats[1].max <= 12 && stats[2].max <= 31) {
                yearIndex = 0;
            } else {
                yearIndex = 2;
            }

            let dayIndex: number;
            let monthIndex: number;

            if (yearIndex === 0) {
                monthIndex = 1;
                dayIndex = 2;
                const monthStats = stats[monthIndex];
                const dayStats = stats[dayIndex];

                if ((monthStats && monthStats.max > 12) || (dayStats && dayStats.max > 31)) {
                    return null;
                }
            } else {
                if (stats[0].max > 31 || stats[1].max > 31) {
                    return null;
                }

                if (stats[0].max > 12 && stats[1].max <= 12) {
                    dayIndex = 0;
                    monthIndex = 1;
                } else if (stats[1].max > 12 && stats[0].max <= 12) {
                    dayIndex = 1;
                    monthIndex = 0;
                } else if (stats[0].max > 12 && stats[1].max > 12) {
                    return null;
                } else if (firstSeparator === '.') {
                    dayIndex = 0;
                    monthIndex = 1;
                } else if (stats[0].variance > stats[1].variance) {
                    dayIndex = 0;
                    monthIndex = 1;
                } else {
                    dayIndex = 1;
                    monthIndex = 0;
                }
            }

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

    constructor(public regExp: RegExp) {}

    public parseDate(date: string): Nullable<Date> {
        const match = date.match(this.regExp);

        if (!match?.groups) {
            return null;
        }

        const format = (digit: number | string, length: number) => digit.toString().padStart(length, '0');
        const day = parseInt(match.groups.day ?? '');
        const month = parseInt(match.groups.month ?? '');
        const year = parseInt(match.groups.year ?? '20' + format(match.groups.shortYear ?? '', 2));

        if (isNaN(day) || isNaN(month) || isNaN(year)) {
            return null;
        }

        if (month < 1 || month > 12 || day < 1 || day > 31) {
            return null;
        }

        const dateInstance = new Date(`${format(year, 4)}-${format(month, 2)}-${format(day, 2)}`);

        if (isNaN(dateInstance.getTime())) {
            return null;
        }

        return dateInstance;
    }
}
