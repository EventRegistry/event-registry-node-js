import * as _ from "lodash";
import { QueryParamsBase } from "./base";
import { ReturnInfo } from "./returnInfo";
import { ER } from "./types";

// provides classes for obtaining information about how frequently individual concepts or categories
// have been mentioned in news articles (if source == "news") of in social media (if source == "social")

export abstract class CountsBase extends QueryParamsBase {
    public get path() {
        return "/json/counters";
    }
}

/**
 * @class GetCounts
 * Obtain information about how frequently a concept or category is mentioned in the articles on particular dates
 * by specifying source="custom" one can obtain counts for custom concepts, such as stocks, macroeconomic indicators, etc. The uri
 * for these can be found using EventRegistry.getCustomConceptUri() method.
 * Usage example:
 *
 *     q = GetCounts([er.getConceptUri("Obama"), er.getConceptUri("ebola")])
 *     ret = er.execQuery(q)
 *
 * Return object:
 *
 *     {
 *         "http://en.wikipedia.org/wiki/Barack_Obama": [
 *             {
 *                 "count": 1,
 *                 "date": "2015-05-07"
 *             },
 *             {
 *                 "count": 4,
 *                 "date": "2015-05-08"
 *             },
 *             ...
 *         ],
 *         "http://en.wikipedia.org/wiki/Ebola_virus_disease": [
 *             {
 *                 "count": 0,
 *                 "date": "2015-05-07"
 *             },
 *             ...
 *         ]
 *     }
 *
 * @param uriOrUriList: concept/category uri or a list of uris
 * @param args Object which contains a host of optional parameters
 */
export class GetCounts extends CountsBase {
    constructor(uriOrUriList: string | string[], args: ER.Counts.Arguments = {}) {
        super();
        const {source = "news", type = "concept", dateStart = undefined, dateEnd = undefined, returnInfo = new ReturnInfo()} = args;
        this.setVal("action", "getCounts");
        this.setVal("source", source);
        this.setVal("type", type);
        this.setVal("uri", uriOrUriList);
        if (!_.isUndefined(dateStart)) {
            this.setDateVal("dateStart", dateStart);
        }
        if (!_.isUndefined(dateEnd)) {
            this.setDateVal("dateEnd", dateEnd);
        }
        this.params = _.extend({}, this.params, returnInfo.getParams());
    }
}

/**
 * @class GetCountsEx
 * Obtain information about how frequently a concept or category is mentioned in the articles on particular dates
 * Similar to GetCounts, but the output is more friendly for a larger set of provided uris/ids at once
 * Usage example:
 *     q = GetCountsEx(type = "category")
 *     q.queryById(range(10))  # return trends of first 10 categories
 *     ret = er.execQuery(q)
 * Return object:
 *     {
 *         "categoryInfo": [
 *             {
 *                 "id": 0,
 *                 "label": "Root",
 *                 "uri": "http://www.dmoz.org"
 *             },
 *             {
 *                 "id": 1,
 *                 "label": "Recreation",
 *                 "uri": "http://www.dmoz.org/Recreation"
 *             },
 *             ...
 *         ],
 *         "counts": [
 *             {
 *                 "0": 23, "1": 42, "2": 52, "3": 32, "4": 21, "5": 65, "6": 32, "7": 654, "8": 1, "9": 34,
 *                 "date": "2015-05-07"
 *             },
 *             ...
 *         ]
 *     }
 * @param uriOrUriList: concept/category uri or a list of uris
 * @param args Object which contains a host of optional parameters
 */
export class GetCountsEx extends CountsBase {
    constructor(uriOrUriList: string | string[], args: ER.Counts.Arguments = {}) {
        super();
        const {source = "news", type = "concept", dateStart = undefined, dateEnd = undefined, returnInfo = new ReturnInfo()} = args;
        this.setVal("action", "GetCountsEx");
        this.setVal("source", source);
        this.setVal("type", type);
        this.setVal("uri", uriOrUriList);
        if (!_.isUndefined(dateStart)) {
            this.setDateVal("dateStart", dateStart);
        }
        if (!_.isUndefined(dateEnd)) {
            this.setDateVal("dateEnd", dateEnd);
        }
        this.params = _.extend({}, this.params, returnInfo.getParams());
    }
}
