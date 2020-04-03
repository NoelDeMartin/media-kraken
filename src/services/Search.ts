import Service from '@/services/Service';

import TheMovieDBApi from '@/api/TheMovieDBApi';

import TheMovieDBMovie from '@/models/third-party/TheMovieDBMovie';
import ThirdPartyMovie from '@/models/third-party/ThirdPartyMovie.js';

import Arr from '@/utils/Arr';
import Time, { DebouncedFunction } from '@/utils/Time';

import MovieModal from '@/components/modals/MovieModal.vue';

const NON_WRITABLE_INPUT_TYPES = ['submit', 'reset', 'checkbox', 'radio'];

export type SearchResult = MovieSearchResult;

interface MovieSearchResult {
    title: string;
    collectionUuid: string | null;
    source: ThirdPartyMovie;
    posterUrl?: string;
    releaseYear?: number;
    watched?: boolean;
}

interface State {
    open: boolean;
    query: string;
    results: SearchResult[];
    highlightedResultIndex: number | null;
}

export default class Search extends Service<State> {

    public searching: boolean = false;

    private searchInput: HTMLInputElement | null = null;
    private searchResultsContainer: HTMLElement | null = null;

    private keyboardListener: EventListener | null = null;
    private removeClickAwayListener: Function | null = null;

    private debouncedSearch: DebouncedFunction = Time.debounce(() => this.updateSearchResults(), 400);

    public get query(): string {
        return this.state.query;
    }

    public get open(): boolean {
        return this.state.open;
    }

    public get results(): SearchResult[] {
        return this.state.results;
    }

    public get highlightedResult(): SearchResult | null {
        return this.state.highlightedResultIndex === null
            ? null
            : this.state.results[this.state.highlightedResultIndex];
    }

    public setSearchInput(input: HTMLInputElement | null): void {
        this.searchInput = input;

        input === null
            ? this.stopListeningKeyboard()
            : this.startListeningKeyboard();
    }

    public setSearchResultsContainer(searchResultsContainer: HTMLElement | null): void {
        this.searchResultsContainer = searchResultsContainer;
    }

    public start(): void {
        if (this.searchInput === null || this.open)
            return;

        this.setState({ open: true });
        this.app.$nextTick(() => this.searchInput!.focus());

        this.removeClickAwayListener = this.app.$ui.onClickAway(
            [this.searchInput, this.searchResultsContainer].filter(el => !!el) as HTMLElement[],
            () => this.stop(),
        );
    }

    public stop(): void {
        if (!this.open)
            return;

        this.setState({
            open: false,
            query: '',
            results: [],
            highlightedResultIndex: null,
        });

        this.debouncedSearch.cancel();

        if (!this.removeClickAwayListener)
            return;

        this.removeClickAwayListener();
        this.removeClickAwayListener = null;
    }

    public async update(query: string): Promise<void> {
        this.setState({
            query,
            results: [],
            highlightedResultIndex: null,
        });

        this.searching = query.trim().length > 0;

        this.searching
            ? this.debouncedSearch.call()
            : this.debouncedSearch.cancel();
    }

    public highlightResult(result: SearchResult): void {
        const index = this.results.indexOf(result);

        if (index === -1 || this.state.highlightedResultIndex === index)
            return;

        this.setState({ highlightedResultIndex: index });
    }

    public higlightResultAbove(): void {
        const resultsLength = this.results.length;
        const highlightedResultIndex = this.state.highlightedResultIndex;

        if (resultsLength === 0)
            return;

        if (highlightedResultIndex === null) {
            this.setState({ highlightedResultIndex: resultsLength - 1 });

            return;
        }

        this.setState({
            highlightedResultIndex: (highlightedResultIndex + resultsLength - 1) % resultsLength,
        });
    }

    public higlightResultBelow(): void {
        const resultsLength = this.results.length;
        const highlightedResultIndex = this.state.highlightedResultIndex;

        if (resultsLength === 0)
            return;

        if (highlightedResultIndex === null) {
            this.setState({ highlightedResultIndex: 0 });

            return;
        }

        this.setState({
            highlightedResultIndex: (highlightedResultIndex + 1) % resultsLength,
        });
    }

    public submit(): void {
        if (this.highlightedResult === null)
            return;

        this.openResult(this.highlightedResult);
    }

    public openResult(result: SearchResult): void {
        if (result.collectionUuid) {
            this.app.$router.push({ name: 'movie', params: { uuid: result.collectionUuid }});

            return;
        }

        this.app.$ui.openModal(MovieModal, { movie: result.source });

        this.stop();
    }

    protected getInitialState(): State {
        return {
            open: false,
            query: '',
            results: [],
            highlightedResultIndex: null,
        };
    }

    private async updateSearchResults() {
        const response = await TheMovieDBApi.searchMovies(this.query.trim());

        const results: SearchResult[] = response.results.slice(0, 6)
            .map(data => new TheMovieDBMovie(data))
            .map(movie => {
                const collectionMovie = this.app.$media.movies.find(m => Arr.contains(m.externalUrls, movie.url));

                return {
                    title: movie.title,
                    collectionUuid: collectionMovie ? collectionMovie.uuid : null,
                    source: movie,
                    posterUrl: movie.posterUrl,
                    releaseYear: movie.releaseDate ? movie.releaseDate.year() : undefined,
                    watched: collectionMovie ? collectionMovie.watched : undefined,
                };
            });

        this.searching = false;
        this.setState({
            results,
            highlightedResultIndex: results.length > 0 ? 0 : null,
        });
    }

    private startListeningKeyboard() {
        if (this.keyboardListener)
            return;

        document.addEventListener('keydown', this.keyboardListener = event => {
            if (!this.captureHotKey(event as KeyboardEvent))
                return;

            event.preventDefault();
        });
    }

    private stopListeningKeyboard() {
        if (!this.keyboardListener)
            return;

        document.removeEventListener('keydown', this.keyboardListener);

        this.keyboardListener = null;
    }

    private captureHotKey({ target, key, keyCode }: KeyboardEvent): boolean {
        if (
            !this.open &&
            Arr.contains(['s', '/'], key.toLowerCase()) &&
            !this.isWritable(target)
        ) {
            this.start();

            return true;
        }

        return false;
    }

    private isWritable(element: any): boolean {
        if (!(element instanceof HTMLElement))
            return false;

        const name = element.nodeName.toLowerCase();

        return name === 'select'
            || (
                name === 'input' &&
                !Arr.contains(
                    NON_WRITABLE_INPUT_TYPES,
                    (element.getAttribute('type'))!.toLowerCase(),
                )
            )
            || name === 'textarea'
            || element.isContentEditable;
    }

}
