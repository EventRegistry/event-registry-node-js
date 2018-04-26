import * as _ from "lodash";
import {mainLangs, Query } from "./base";
import {ArticleInfoFlags, ReturnInfo } from "./returnInfo";

export class QueryStory extends Query<RequestStory> {
    constructor(storyUriOrList) {
        super();
        this.setVal("action", "getStory");
        this.queryByUri(storyUriOrList);
    }

    public get path() {
        return "/json/story";
    }

    public queryByUri(uriOrUriList) {
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
                } = {}) {
        super();
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
        this.params = _.extend({}, this.params, returnInfo.getParams("articles"));
    }
}

export class RequestStoryArticleUris extends RequestStory {
    public resultType = "articleUris";
    public params;

    constructor({ sortBy = "cosSim",
                  sortByAsc = false,
                } = {}) {
        super();
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
                } = {}) {
        super();
        this.params = {};
        this.params["articleTrendLang"] = lang;
        this.params["articleTrendMinArticleCosSim"] = minArticleCosSim;
        this.params = _.extend({}, this.params, returnInfo.getParams("articles"));
    }
}

export class RequestStorySimilarStories extends RequestStory {
    public resultType = "similarStories";
    public params;

    constructor({ count = 50,
                  source = "concept",
                  maxDayDiff = Number.MAX_SAFE_INTEGER,
                  addArticleTrendInfo = false,
                  returnInfo = new ReturnInfo({articleInfo: new ArticleInfoFlags({bodyLen: 0})}),
                } = {}) {
        super();
        if (count > 50) {
          throw new RangeError("At most 50 stories can be returned per call");
        }
        this.params = {};
        this.params["similarStoriesCount"] = count;
        this.params["similarStoriesSource"] = source;
        if (maxDayDiff !== Number.MAX_SAFE_INTEGER) {
            this.params["similarStoriesMaxDayDiff"] = maxDayDiff;
        }
        this.params["similarStoriesAddArticleTrendInfo"] = addArticleTrendInfo;
        this.params = _.extend({}, this.params, returnInfo.getParams("similarStories"));
    }
}
