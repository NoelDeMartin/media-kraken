// TODO replace with @noeldemartin/utils on update

export function updateQueryParameters(parameters: Record<string, string | undefined>): void {
    const url = Object.entries(parameters).reduce(
        (_url, [parameter, value]) => {
            value
                ? _url.searchParams.set(parameter, value)
                : _url.searchParams.delete(parameter);

            return _url;
        },
        new URL(location.href),
    );

    history.replaceState(null, document.title, url.href);
}

export function getQueryParameter<T extends string = string>(parameter: string): string | null {
    const url = new URL(location.href);
    const queryParameters = {} as Record<string, string>;

    url.searchParams.forEach((value, key) => (queryParameters[key] = value));

    return queryParameters[parameter] ?? null;
}
