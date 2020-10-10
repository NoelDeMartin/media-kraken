import Service from '@/services/Service';

import TheMovieDBApi from '@/api/TheMovieDBApi';

import Arr from '@/utils/Arr';
import DOM from '@/utils/DOM';
import Str from '@/utils/Str';
import Time, { DebouncedFunction } from '@/utils/Time';
import TMDBMoviesParser from '@/utils/parsers/TMDBMoviesParser';

import MovieModal from '@/components/modals/MovieModal.vue';
import Movie from '@/models/soukai/Movie';

export type SearchResult = Movie;

interface State {
    open: boolean;
    query: string;
    results: SearchResult[];
    highlightedResultIndex: number | null;
}

export default class Search extends Service<State> {

    protected storeName: string = 'search';

    public searching: boolean = false;

    private searchInput: HTMLInputElement | null = null;
    private searchResultsContainer: HTMLElement | null = null;

    private keyboardListener: EventListener | null = null;
    private removeClickAwayListener: Function | null = null;

    private search: DebouncedFunction<[]> = Time.debounce(
        () => this.updateSearchResults(),
        400,
    );

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

        this.search.cancel();

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

        if (!this.searching) {
            this.search.cancel();

            return;
        }

        if (query.startsWith('/'))
            this.updateSearchResults();
        else
            this.search();
    }

    public highlightResult(result: SearchResult): void {
        const index = this.results.indexOf(result);

        if (index === -1 || this.state.highlightedResultIndex === index)
            return;

        this.setState({ highlightedResultIndex: index });
    }

    public highlightResultAbove(): void {
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

    public highlightResultBelow(): void {
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
        if (!result.exists())
            this.app.$ui.openModal(MovieModal, { movie: result });
        else if (
            this.app.$router.currentRoute.name !== 'movie' ||
            this.app.$router.currentRoute.params?.uuid !== result.uuid
        )
            this.app.$router.push({ name: 'movie', params: { uuid: result.uuid! }});

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
        const getSearchResults = async (query: string): Promise<SearchResult[]> => {
            if (query.startsWith('/')) {
                const filterText = Str.slug(query, '');

                return this.app.$media.searchIndex
                    .filter(entry => Str.contains(entry.searchableText, filterText))
                    .map(entry => entry.movie);
            }

            const response = await TheMovieDBApi.searchMovies(query.trim());
            const promisedResults = response.results.map(async data => {
                const movie = await TMDBMoviesParser.parse(data);

                return this.app.$media.movies.find(collectionMovie => collectionMovie.is(movie))
                    || movie;
            });
            return await Promise.all(promisedResults);
        };

        const results = await getSearchResults(this.query.trim());

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

    private captureHotKey({ target, key }: KeyboardEvent): boolean {
        if (
            !this.open &&
            Arr.contains(key.toLowerCase(), ['s', '/']) &&
            !DOM.isWritable(target)
        ) {
            this.start();

            if (key === '/')
                this.update('/');

            return true;
        }

        return false;
    }

}
