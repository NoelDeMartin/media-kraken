export function minutesToISODuration(minutes: number): string {
    const rounded = Math.max(0, Math.round(minutes));
    const hours = Math.floor(rounded / 60);
    const remainingMinutes = rounded % 60;

    if (hours > 0 && remainingMinutes > 0) {
        return `PT${hours}H${remainingMinutes}M`;
    }

    if (hours > 0) {
        return `PT${hours}H`;
    }

    return `PT${remainingMinutes}M`;
}

export function isoDurationToMinutes(duration: string): number | null {
    const match = duration.match(/^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/);

    if (!match || (!match[1] && !match[2] && !match[3] && !match[4])) {
        return null;
    }

    const days = match[1] ? Number(match[1]) : 0;
    const hours = match[2] ? Number(match[2]) : 0;
    const minutes = match[3] ? Number(match[3]) : 0;
    const seconds = match[4] ? Number(match[4]) : 0;

    return days * 24 * 60 + hours * 60 + minutes + Math.round(seconds / 60);
}
