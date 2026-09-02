import { EventRegistry } from "../eventRegistry";
import { RequestArticlesInfo } from "../queryArticles";
import { ReturnInfo } from "../returnInfo";
import { ER } from "../types";
import { Data } from "../data";
import { getArticle, iterateArticles, searchArticles } from "../helpers/articles";

export class ArticlesFluent {
    constructor(private readonly er: EventRegistry) {}

    search(args: Omit<ER.QueryArticles.Arguments, "requestedResult"> = {}): ArticlesSearchBuilder {
        return new ArticlesSearchBuilder(this.er, args);
    }

    iterate(args: ER.QueryArticles.IteratorArguments = {}): AsyncIterable<Data.Article> {
        return iterateArticles(this.er, args);
    }

    get(articleUri: string, args: { returnInfo?: ReturnInfo } = {}): Promise<ER.Response> {
        return getArticle(this.er, articleUri, args);
    }
}

class ArticlesSearchBuilder {
    private infoOpts: ConstructorParameters<typeof RequestArticlesInfo>[0] = {};

    constructor(
        private readonly er: EventRegistry,
        private readonly args: Omit<ER.QueryArticles.Arguments, "requestedResult">
    ) {}

    info(opts: ConstructorParameters<typeof RequestArticlesInfo>[0] = {}): this {
        this.infoOpts = opts ?? {};
        return this;
    }

    exec(): Promise<ER.Response> {
        return searchArticles(this.er, { ...this.args, ...this.infoOpts });
    }
}
