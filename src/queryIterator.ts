import { isCancellation } from "./abort";

/**
 * Shared pagination engine backing QueryArticlesIter and QueryEventsIter.
 * Each caller supplies a `fetchPage` closure that knows how to build/execute
 * the request for its entity type; this engine owns the page/index bookkeeping,
 * the async-iterator protocol, and the callback-based execQuery() loop.
 */
export interface PageFetchResult<TItem> {
    results: TItem[];
    pages: number;
    error?: string;
}

export interface QueryIterationEngineOptions<TItem> {
    /** Caller's abort signal: once aborted no further page is requested and iteration rejects. */
    signal?: AbortSignal;
    maxItems: number;
    entityLabel: string;
    fetchPage: (page: number) => Promise<PageFetchResult<TItem>>;
    onError: (message: string) => void;
}

export class QueryIterationEngine<TItem> implements AsyncIterable<TItem> {
    private page = 0;
    private pages = 1;
    private items: TItem[] = [];
    private returnedSoFar = 0;
    private index = 0;
    private callback: (item: TItem) => void = () => undefined;
    private doneCallback: (error?: string) => void = () => undefined;
    private errorMessage?: string;

    constructor(private readonly options: QueryIterationEngineOptions<TItem>) {}

    public [Symbol.asyncIterator](): AsyncIterator<TItem> {
        return {
            next: async () => {
                this.options.signal?.throwIfAborted();
                if (this.index >= this.items.length) {
                    await this.getNextBatch();
                }
                const item = this.items[this.index];
                this.index++;
                return { value: item, done: !item };
            }
        };
    }

    public execQuery(callback: (item: TItem) => void, doneCallback?: (error?: string) => void): void {
        if (callback) { this.callback = callback; }
        if (doneCallback) { this.doneCallback = doneCallback; }
        this.iterate().catch((error: unknown) => this.doneCallback(error instanceof Error ? error.message : String(error)));
    }

    private get current(): TItem | undefined {
        return this.items[this.index] || undefined;
    }

    private async iterate(): Promise<void> {
        for (;;) {
            if (this.current) {
                this.callback(this.current);
                this.index += 1;
            } else if (!await this.getNextBatch()) {
                this.doneCallback(this.errorMessage);
                return;
            }
        }
    }

    public async getNextBatch(): Promise<boolean> {
        this.page += 1;
        const { maxItems, fetchPage, onError, entityLabel } = this.options;
        if (this.page > this.pages || (maxItems !== -1 && this.returnedSoFar >= maxItems)) {
            return false;
        }
        try {
            const { results, pages, error } = await fetchPage(this.page);
            if (error) {
                this.errorMessage = `Error while obtaining a list of ${entityLabel}:  ${error}`;
            } else {
                this.pages = pages;
            }
            const extractedSize = maxItems !== -1 ? maxItems - this.returnedSoFar : results.length;
            const extracted = results.slice(0, extractedSize).filter(Boolean);
            this.returnedSoFar += extracted.length;
            // Only the current page is buffered, so consumed items can be garbage collected.
            this.items = extracted;
            this.index = 0;
            return true;
        } catch (err) {
            if (isCancellation(err, this.options.signal)) {
                throw err;
            }
            onError(err instanceof Error ? err.message : String(err));
            return false;
        }
    }
}
