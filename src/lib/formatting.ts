const durationFormatter =
    'DurationFormat' in Intl
        ? new (Intl as any).DurationFormat(undefined, { style: 'narrow' }) // oxlint-disable-line typescript/no-explicit-any
        : {
              format: ({ minutes, hours }: { minutes: number; hours: number }) =>
                  hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`,
          };
const hoursFormatter = new Intl.NumberFormat(undefined, { style: 'unit', unit: 'hour', unitDisplay: 'long' });
const numberFormatter = new Intl.NumberFormat(undefined);
const percentageFormatter = new Intl.NumberFormat(undefined, { style: 'percent', maximumFractionDigits: 0 });
const countryFormatter = new Intl.DisplayNames(undefined, { type: 'region' });
const languageFormatter = new Intl.DisplayNames(undefined, { type: 'language' });

export function formatDate(date: Date): string {
    return date.toLocaleDateString(undefined, {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });
}

export function formatPercentage(value: number): string {
    return percentageFormatter.format(value);
}

export function formatNumber(value: number): string {
    return numberFormatter.format(value);
}

export function formatHours(value: number): string {
    return hoursFormatter.format(value);
}

export function formatDuration(duration: { minutes: number }): string {
    const minutes = duration.minutes % 60;
    const hours = Math.floor(duration.minutes / 60);

    return durationFormatter.format({ minutes, hours }) || '0m';
}

export function formatCountry(country: string): string {
    try {
        return countryFormatter.of(country) || country;
    } catch {
        return country;
    }
}

export function formatLanguage(language: string): string {
    try {
        return languageFormatter.of(language) || language;
    } catch {
        return language;
    }
}
