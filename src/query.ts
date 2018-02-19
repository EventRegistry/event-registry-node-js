import * as _ from "lodash";
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

    public setQueryParam(paramName, val) {
        this.queryObj[paramName] = val;
    }

    protected setValIfNotDefault(propName, value, defVal) {
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
    constructor(args: ER.Query.BaseQueryArguments = {}) {
        super();
        _.defaults(args, {
            keywordLoc: "body",
            categoryIncludeSub: true,
        });
        this.setQueryArrVal("keyword", args.keyword);
        this.setQueryArrVal("conceptUri", args.conceptUri);
        this.setQueryArrVal("categoryUri", args.categoryUri);
        this.setQueryArrVal("sourceUri", args.sourceUri);
        this.setQueryArrVal("locationUri", args.locationUri);
        this.setQueryArrVal("lang", args.lang);

        if (!_.isNil(args.dateStart)) {
            this.queryObj["dateStart"] = QueryParamsBase.encodeDateTime(args.dateStart, "YYYY-MM-DD");
        }

        if (!_.isNil(args.dateEnd)) {
            this.queryObj["dateEnd"] = QueryParamsBase.encodeDateTime(args.dateEnd, "YYYY-MM-DD");
        }

        if (!_.isNil(args.dateMention)) {
            if (_.isArray(args.dateMention)) {
                this.queryObj["dateMention"] = _.map(args.dateMention, (date) => QueryParamsBase.encodeDateTime(date, "YYYY-MM-DD"));
            } else {
                this.queryObj["dateMention"] = QueryParamsBase.encodeDateTime(args.dateMention, "YYYY-MM-DD");
            }
        }
        this.setQueryArrVal("sourceLocationUri", args.sourceLocationUri);
        this.setQueryArrVal("sourceGroupUri", args.sourceGroupUri);

        if (!args.categoryIncludeSub) {
            this.queryObj["categoryIncludeSub"] = false;
        }

        if (args.keywordLoc !== "body") {
            this.queryObj["keywordLoc"] = args.keywordLoc;
        }

        if (!_.isNil(args.minMaxArticlesInEvent)) {
            if (!_.isArray() || _.size(args.minMaxArticlesInEvent) !== 2) {
                throw new Error("minMaxArticlesInEvent parameter should either be None or a tuple with two integer values");
            }
            this.queryObj["minArticlesInEvent"] = args.minMaxArticlesInEvent[0];
            this.queryObj["maxArticlesInEvent"] = args.minMaxArticlesInEvent[1];
        }

        if (!_.isNil(args.exclude)) {
            if (!(args.exclude instanceof QueryCore)) {
                throw new Error("exclude parameter was not a CombinedQuery or BaseQuery instance");
            }
            this.queryObj["$not"] = args.exclude.getQuery();
        }
    }

    protected setQueryArrVal(propName, value: string | string[] | QueryItems) {
        if (_.isNil(value)) {
            return;
        }
        if (value instanceof QueryItems) {
            _.set(this.queryObj, `${propName}.${value.getOper()}`, value.getItems());
        } else if (_.isString(value)) {
            _.set(this.queryObj, propName, value);
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
        if (!_.isArray(queryArr)) {
            throw new Error("provided argument as not a list");
        }
        if (_.isEmpty(queryArr)) {
            throw new Error("queryArr had an empty list");
        }
        const query = new CombinedQuery();
        query.queryObj["$and"] = [];
        _.each(queryArr, (item) => {
            if (!(item instanceof QueryCore)) {
                throw new Error("item in the list was not a CombinedQuery or BaseQuery instance");
            }
            query.queryObj["$and"] = [...query.queryObj["$and"], item.getQuery()];
        });

        if (!_.isNil(exclude)) {
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
        if (!_.isArray(queryArr)) {
            throw new Error("provided argument as not a list");
        }
        if (_.isEmpty(queryArr)) {
            throw new Error("queryArr had an empty list");
        }
        const query = new CombinedQuery();
        query.queryObj["$or"] = [];
        _.each(queryArr, (item) => {
            if (!(item instanceof QueryCore)) {
                throw new Error("item in the list was not a CombinedQuery or BaseQuery instance");
            }
            query.queryObj["$or"] = [...query.queryObj["$or"], item.getQuery()];
        });

        if (!_.isNil(exclude)) {
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
        _.defaults(args, {
            isDuplicateFilter: "keepAll",
            hasDuplicateFilter: "keepAll",
            eventFilter: "keepAll",
        });
        if (!(query instanceof QueryCore)) {
            throw new Error("query parameter was not a CombinedQuery or BaseQuery instance");
        }
        this.queryObj["$query"] = query.getQuery();
        const filter = {};
        if (_.get(args, "isDuplicateFilter") !== "keepAll") {
            filter["isDuplicate"] = _.get(args, "isDuplicateFilter");
        }
        if (_.get(args, "hasDuplicateFilter") !== "keepAll") {
            filter["hasDuplicate"] = _.get(args, "hasDuplicateFilter");
        }
        if (_.get(args, "eventFilter") !== "keepAll") {
            filter["hasEvent"] = _.get(args, "eventFilter");
        }
        if (!_.isEmpty(filter)) {
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
    constructor(query: BaseQuery | CombinedQuery) {
        super();
        if (!(query instanceof QueryCore)) {
            throw new Error("query parameter was not a CombinedQuery or BaseQuery instance");
        }
        this.queryObj["$query"] = query.getQuery();
    }
}
