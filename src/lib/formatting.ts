const durationFormatter =
    'DurationFormat' in Intl
        ? new (Intl as any).DurationFormat(undefined, { style: 'narrow' }) // oxlint-disable-line typescript/no-explicit-any
        : {
              format: ({ minutes, hours }: { minutes: number; hours: number }) =>
                  hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`,
          };
const countryFormatter = new Intl.DisplayNames(undefined, { type: 'region' });
const languageFormatter = new Intl.DisplayNames(undefined, { type: 'language' });

export function formatDate(date: Date): string {
    return date.toLocaleDateString(undefined, {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });
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
