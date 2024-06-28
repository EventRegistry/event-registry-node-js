import {mainLangs, Query, QueryParamsBase } from "./base";
import {ArticleInfoFlags, ReturnInfo } from "./returnInfo";
import { Logger } from "./logger";

export class QueryStory extends Query<RequestStory> {
    constructor(storyUriOrList) {
        super();
        this.setVal("action", "getStory");
        this.queryByUri(storyUriOrList);
    }

    public get path() {
        return "/api/v1/story";
    }

    /**
     * Search stories by their uri(s)
     */
    public queryByUri(uriOrUriList: string | string[]) {
        this.setVal("storyUri", uriOrUriList);
    }

    public setRequestedResult(requestStory) {
        if (!(requestStory instanceof RequestStory)) {
            throw Error("QueryStory class can only accept result requests that are of type RequestStory");
        }
        this.resultTypeList = [requestStory];
    }

}

export class RequestStory {}

export class RequestStoryInfo extends RequestStory {
    public resultType = "info";
    public params;

    constructor(returnInfo = new ReturnInfo()) {
        super();
        this.params = returnInfo.getParams("info");
    }
}

export class RequestStoryArticles extends RequestStory {
    public resultType = "articles";
    public params;

    constructor({ page = 1,
                  count = 100,
                  sortBy = "cosSim",
                  sortByAsc = false,
                  returnInfo = new ReturnInfo({articleInfo: new ArticleInfoFlags({bodyLen: 200})}),
                  ...unsupported
                } = {}) {
        super();
        if (Object.keys(unsupported).length > 0) {
            Logger.warn(`RequestStoryArticles: Unsupported parameters detected: ${JSON.stringify(unsupported)}. Please check the documentation.`);
        }
        if (page < 1) {
          throw new RangeError("Page has to be >= 1");
        }
        if (count > 100) {
          throw new RangeError("At most 100 articles can be returned per call");
        }
        this.params = {};
        this.params["articlesPage"] = page;
        this.params["articlesCount"] = count;
        this.params["articlesSortBy"] = sortBy;
        this.params["articlesSortByAsc"] = sortByAsc;
        this.params = {...this.params, ...returnInfo.getParams("articles")};
    }
}

export class RequestStoryArticleUris extends RequestStory {
    public resultType = "articleUris";
    public params;

    constructor({ sortBy = "cosSim",
                  sortByAsc = false,
                  ...unsupported
                } = {}) {
        super();
        if (Object.keys(unsupported).length > 0) {
            Logger.warn(`RequestStoryArticleUris: Unsupported parameters detected: ${JSON.stringify(unsupported)}. Please check the documentation.`);
        }
        this.params = {};
        this.params["articleUrisSortBy"] = sortBy;
        this.params["articleUrisSortByAsc"] = sortByAsc;
    }
}

export class RequestStoryArticleTrend extends RequestStory {
    public resultType = "articleTrend";
    public params;

    constructor({ lang = mainLangs,
                  minArticleCosSim = -1,
                  returnInfo = new ReturnInfo({articleInfo: new ArticleInfoFlags({bodyLen: 0})}),
                  ...unsupported
                } = {}) {
        super();
        if (Object.keys(unsupported).length > 0) {
            Logger.warn(`RequestStoryArticleTrend: Unsupported parameters detected: ${JSON.stringify(unsupported)}. Please check the documentation.`);
        }
        this.params = {};
        this.params["articleTrendLang"] = lang;
        this.params["articleTrendMinArticleCosSim"] = minArticleCosSim;
        this.params = {...this.params, ...returnInfo.getParams("articles")};
    }
}

export class RequestStorySimilarStories extends RequestStory {
    public resultType = "similarStories";
    public params;

    constructor({ conceptInfoList = undefined,
                  count = 50,
                  dateStart = undefined,
                  dateEnd = undefined,
                  lang = [],
                  returnInfo = new ReturnInfo(),
                  ...unsupported
                } = {}) {
        super();
        if (Object.keys(unsupported).length > 0) {
            Logger.warn(`RequestStorySimilarStories: Unsupported parameters detected: ${JSON.stringify(unsupported)}. Please check the documentation.`);
        }
        if (count > 50) {
          throw new RangeError("At most 50 stories can be returned per call");
        }
        if (!Array.isArray(conceptInfoList)) {
            throw new Error("Concept list is not an array!");
        }
        this.params = {};
        this.params["action"] = "getSimilarStories";
        this.params["concepts"] = JSON.stringify(conceptInfoList);
        this.params["storiesCount"] = count;

        if (!!dateStart) {
            this.params["dateStart"] = QueryParamsBase.encodeDateTime( dateStart, "YYYY-MM-DD" );
        }

        if (!!dateEnd) {
            this.params["dateEnd"] = QueryParamsBase.encodeDateTime( dateEnd, "YYYY-MM-DD" );
        }

        if (lang.length > 0) {
            this.params["lang"] = lang;
        }
        this.params = {...this.params, ...returnInfo.getParams("similarStories")};
    }
}
