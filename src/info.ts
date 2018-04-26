import * as _ from "lodash";
import { QueryParamsBase } from "./base";
import { ReturnInfo } from "./returnInfo";
import { ER } from "./types";

/**
 * @class GetSourceInfo
 * Obtain desired information about one or more news sources
 */
export class GetSourceInfo extends QueryParamsBase {
    /**
     * @param args Object which contains a host of optional parameters
     */
    constructor(args: ER.Info.GetSourceInfoArguments = {}) {
        super();
        const {uriOrUriList = undefined, returnInfo = new ReturnInfo()} = args;
        this.setVal("action", "getInfo");
        if (!_.isUndefined(uriOrUriList)) {
            this.queryByUri(uriOrUriList);
        }
        this.params = _.extend({}, this.params, returnInfo.getParams("source"));
    }

    /**
     * search sources by uri(s)
     */
    public queryByUri(uriOrUriList: string | string[]) {
        this.setVal("uri", uriOrUriList);
    }

    /**
     * search concepts by id(s)
     */
    public queryById(idOrIdList: string | string[]) {
        this.setVal("id", idOrIdList);
    }

    public get path(): string {
        return "/json/source";
    }
}

/**
 * @class GetConceptInfo
 * Obtain information about concepts
 */
export class GetConceptInfo extends QueryParamsBase {
    constructor(args: ER.Info.GetConceptInfoArguments = {}) {
        super();
        const {uriOrUriList = undefined, returnInfo = new ReturnInfo()} = args;
        this.setVal("action", "getInfo");
        if (!_.isUndefined(uriOrUriList)) {
            this.setVal("uri", uriOrUriList);
        }
        this.params = _.extend({}, this.params, returnInfo.getParams("concept"));
    }

    public get path(): string {
        return "/json/concept";
    }
}

/**
 * @class GetCategoryInfo
 * Obtain information about categories
 */
export class GetCategoryInfo extends QueryParamsBase {
    constructor(args: ER.Info.GetCategoryInfoArguments = {}) {
        super();
        const {uriOrUriList = undefined, returnInfo = new ReturnInfo()} = args;
        this.setVal("action", "getInfo");
        if (!_.isUndefined(uriOrUriList)) {
            this.queryByUri(uriOrUriList);
        }
        this.params = _.extend({}, this.params, returnInfo.getParams("category"));
    }

    /**
     * search concepts by uri(s)
     */
    public queryByUri(uriOrUriList) {
        this.setVal("uri", uriOrUriList);
    }

    public get path(): string {
        return "/json/category";
    }
}

/**
 * @class GetSourceStats
 * get stats about one or more sources - return json object will include:
 *  "uri"
 *  "id"
 *  "totalArticles" - total number of articles from this source
 *  "withStory" - number of articles assigned to a story (cluster)
 *  "duplicates" - number of articles that are duplicates of another article
 *  "duplicatesFromSameSource" - number of articles that are copies from articles
 *     from the same source (not true duplicates, just updates of own articles)
 *  "dailyCounts" - json object with date as the key and number of articles for that day as the value
 */
export class GetSourceStats extends QueryParamsBase {
    constructor(sourceUri?: string) {
        super();
        this.setVal("action", "getStats");
        if (sourceUri) {
            this.setVal("uri", sourceUri);
        }
    }

    /**
     * get stats about one or more sources specified by their uris
     */
    public queryByUri(uriOrUriList) {
        this.setVal("uri", uriOrUriList);
    }

    public get path(): string {
        return "/json/source";
    }
}
