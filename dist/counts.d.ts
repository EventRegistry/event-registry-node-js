import { QueryParamsBase } from "./base";
import { ER } from "./types";
export declare abstract class CountsBase extends QueryParamsBase {
    readonly path: string;
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
export declare class GetCounts extends CountsBase {
    constructor(uriOrUriList: string | string[], args?: ER.Counts.Arguments);
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
export declare class GetCountsEx extends CountsBase {
    constructor(uriOrUriList: string | string[], args?: ER.Counts.Arguments);
}
