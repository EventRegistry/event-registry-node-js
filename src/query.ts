import { QueryItems, QueryParamsBase } from "./base";
import { ER } from "./types";
export abstract class QueryCore {
    protected queryObj;

    constructor() {
        this.queryObj = {};
    }

    public getQuery() {
        return this.queryObj;
    }

    public setQueryParam(paramName: string, val: unknown) {
        this.queryObj[paramName] = val;
    }

    protected setValIfNotDefault(propName: string, value: unknown, defVal: unknown) {
        if (value !== defVal) {
            this.queryObj[propName] = value;
        }
    }
}

export class BaseQuery extends QueryCore {
    protected queryObj;
    /**
     * @param args Object which contains a host of optional parameters
     */
    constructor(parameters: ER.Query.BaseQueryArguments = {}) {
        super();
        const defaults = {
            keywordLoc: "body",
            categoryIncludeSub: true,
        };
        const args = {
            ...defaults,
            ...parameters
        };
        this.setQueryArrVal("keyword", args.keyword);
        this.setQueryArrVal("conceptUri", args.conceptUri);
        this.setQueryArrVal("categoryUri", args.categoryUri);
        this.setQueryArrVal("sourceUri", args.sourceUri);
        this.setQueryArrVal("locationUri", args.locationUri);
        this.setQueryArrVal("lang", args.lang);

        if (args.dateStart != null) {
            this.queryObj["dateStart"] = QueryParamsBase.encodeDateTime(args.dateStart, "YYYY-MM-DD");
        }

        if (args.dateEnd != null) {
            this.queryObj["dateEnd"] = QueryParamsBase.encodeDateTime(args.dateEnd, "YYYY-MM-DD");
        }

        if (args.dateMention != null) {
            if (Array.isArray(args.dateMention)) {
                this.queryObj["dateMention"] = args.dateMention.map(date => QueryParamsBase.encodeDateTime(date, "YYYY-MM-DD"));
            } else {
                this.queryObj["dateMention"] = QueryParamsBase.encodeDateTime(args.dateMention, "YYYY-MM-DD");
            }
        }
        this.setQueryArrVal("sourceLocationUri", args.sourceLocationUri);
        this.setQueryArrVal("sourceGroupUri", args.sourceGroupUri);
        this.setQueryArrVal("authorUri", args.authorUri);

        if (!args.categoryIncludeSub) {
            this.queryObj["categoryIncludeSub"] = false;
        }

        if (args.keywordLoc !== "body") {
            this.queryObj["keywordLoc"] = args.keywordLoc;
        }

        if (args.minMaxArticlesInEvent != null) {
            if (!Array.isArray(args.minMaxArticlesInEvent) || args.minMaxArticlesInEvent.length !== 2) {
                throw new Error("minMaxArticlesInEvent parameter should either be None or a tuple with two integer values");
            }
            this.queryObj["minArticlesInEvent"] = args.minMaxArticlesInEvent[0];
            this.queryObj["maxArticlesInEvent"] = args.minMaxArticlesInEvent[1];
        }

        if (args.exclude != null) {
            if (!(args.exclude instanceof QueryCore)) {
                throw new Error("exclude parameter was not a CombinedQuery or BaseQuery instance");
            }
            this.queryObj["$not"] = args.exclude.getQuery();
        }
    }

    protected setQueryArrVal(propName: string, value: string | string[] | QueryItems) {
        if (value === null || value === undefined) {
            return;
        }
        if (value instanceof QueryItems) {
            this.queryObj[propName] = this.queryObj[propName] || {};
            this.queryObj[propName][value.getOper()] = value.getItems();
        } else if (typeof value === "string") {
            this.queryObj[propName] = value;
        } else {
            throw new Error(`Parameter '${propName}' was of unsupported type. It should either be undefined, a string or an instance of QueryItems`);
        }
    }
}

export class CombinedQuery extends QueryCore {
    protected queryObj;

    /**
     * Create a combined query with multiple items on which to perform an AND operation
     * @param queryArr a list of items on which to perform an AND operation. Items can be either a CombinedQuery or BaseQuery instances.
     * @param exclude Used to filter out results matching the other criteria specified in this query
     */
    public static AND(queryArr: Array<BaseQuery | CombinedQuery>, exclude?: BaseQuery | CombinedQuery) {
        if (!Array.isArray(queryArr)) {
            throw new Error("provided argument as not a list");
        }
        if (queryArr.length === 0) {
            throw new Error("queryArr had an empty list");
        }
        const query = new CombinedQuery();
        query.queryObj["$and"] = [];
        for (const item of queryArr) {
            if (!(item instanceof QueryCore)) {
                throw new Error("item in the list was not a CombinedQuery or BaseQuery instance");
            }
            query.queryObj["$and"] = [...query.queryObj["$and"], item.getQuery()];
        }

        if (exclude !== null && exclude !== undefined) {
            if (!(exclude instanceof QueryCore)) {
                throw new Error("exclude parameter was not a CombinedQuery or BaseQuery instance");
            }
            query.setQueryParam("$not", exclude.getQuery());
        }

        return query;
    }

    /**
     * Create a combined query with multiple items on which to perform an OR operation
     * @param queryArr A list of items on which to perform an OR operation.
     * @param exclude Used to filter out results matching the other criteria specified in this query.
     */
    public static OR(queryArr: Array<BaseQuery | CombinedQuery>, exclude?: BaseQuery | CombinedQuery) {
        if (!Array.isArray(queryArr)) {
            throw new Error("provided argument as not a list");
        }
        if (queryArr.length === 0) {
            throw new Error("queryArr had an empty list");
        }
        const query = new CombinedQuery();
        query.queryObj["$or"] = [];
        queryArr.forEach((item) => {
            if (!(item instanceof QueryCore)) {
                throw new Error("item in the list was not a CombinedQuery or BaseQuery instance");
            }
            query.queryObj["$or"] = [...query.queryObj["$or"], item.getQuery()];
        });

        if (exclude !== null && exclude !== undefined) {
            if (!(exclude instanceof QueryCore)) {
                throw new Error("exclude parameter was not a CombinedQuery or BaseQuery instance");
            }
            query.setQueryParam("$not", exclude.getQuery());
        }
        return query;
    }
}

/**
 * @class ComplexArticleQuery
 * Create an article query using a complex query
 */
export class ComplexArticleQuery extends QueryCore {
    protected queryObj;

    /**
     * @param query An instance of CombinedQuery or BaseQuery to use to find articles that match the conditions
     * @param args Object which contains a host of optional parameters
     */
    constructor(query: CombinedQuery | BaseQuery, args: ER.Query.ComplexArticleQueryArguments = {}) {
        super();
        const defaults = {
            dataType: "news",
            minSentiment: undefined,
            maxSentiment: undefined,
            minSocialScore: 0,
            minFacebookShares: 0,
            startSourceRankPercentile: 0,
            endSourceRankPercentile: 0,
            isDuplicateFilter: "keepAll",
            hasDuplicateFilter: "keepAll",
            eventFilter: "keepAll",
        };
        args = { ...defaults, ...args } as ER.Query.ComplexArticleQueryArguments;
        if (!(query instanceof QueryCore)) {
            throw new Error("query parameter was not a CombinedQuery or BaseQuery instance");
        }
        this.queryObj["$query"] = query.getQuery();
        const filter = {};
        if (args.dataType !== "news") {
            filter["dataType"] = args.dataType;
        }
        if (args.minSentiment) {
            filter["minSentiment"] = args.minSentiment;
        }
        if (args.maxSentiment) {
            filter["maxSentiment"] = args.maxSentiment;
        }
        if (args.minSocialScore > 0) {
            filter["minSocialScore"] = args.minSocialScore;
        }
        if (args.minFacebookShares > 0) {
            filter["minFacebookShares"] = args.minFacebookShares;
        }
        if (args.startSourceRankPercentile !== 0) {
            filter["startSourceRankPercentile"] = args.startSourceRankPercentile;
        }
        if (args.endSourceRankPercentile !== 0) {
            filter["endSourceRankPercentile"] = args.endSourceRankPercentile;
        }
        if (args.isDuplicateFilter !== "keepAll") {
            filter["isDuplicate"] = args.isDuplicateFilter;
        }
        if (args.hasDuplicateFilter !== "keepAll") {
            filter["hasDuplicate"] = args.hasDuplicateFilter;
        }
        if (args.eventFilter !== "keepAll") {
            filter["hasEvent"] = args.eventFilter;
        }
        if (Object.keys(filter).length > 0) {
            this.queryObj["$filter"] = filter;
        }
    }
}

/**
 * @class ComplexEventQuery
 */
export class ComplexEventQuery extends QueryCore {
    /**
     * @param query an instance of CombinedQuery or BaseQuery to use to find events that match the conditions
     */
    constructor(query: BaseQuery | CombinedQuery, args: ER.Query.ComplexEventQueryArguments = {}) {
        super();
        if (!(query instanceof QueryCore)) {
            throw new Error("query parameter was not a CombinedQuery or BaseQuery instance");
        }
        this.queryObj["$query"] = query.getQuery();
        const filter = {};
        if (args?.minSentiment) {
            filter["minSentiment"] = args.minSentiment;
        }
        if (args?.maxSentiment) {
            filter["maxSentiment"] = args.maxSentiment;
        }
        if (Object.keys(filter).length > 0) {
            this.queryObj["$filter"] = filter;
        }
    }
}
