import { QueryItems } from "./base";
import { ER } from "./types";
export declare abstract class QueryCore {
    protected queryObj: any;
    constructor();
    getQuery(): any;
    setQueryParam(paramName: any, val: any): void;
    protected setValIfNotDefault(propName: any, value: any, defVal: any): void;
}
export declare class BaseQuery extends QueryCore {
    protected queryObj: any;
    /**
     * @param args Object which contains a host of optional parameters
     */
    constructor(args?: ER.Query.BaseQueryArguments);
    protected setQueryArrVal(propName: any, value: string | string[] | QueryItems): void;
}
export declare class CombinedQuery extends QueryCore {
    protected queryObj: any;
    /**
     * Create a combined query with multiple items on which to perform an AND operation
     * @param queryArr a list of items on which to perform an AND operation. Items can be either a CombinedQuery or BaseQuery instances.
     * @param exclude Used to filter out results matching the other criteria specified in this query
     */
    static AND(queryArr: Array<BaseQuery | CombinedQuery>, exclude?: BaseQuery | CombinedQuery): CombinedQuery;
    /**
     * Create a combined query with multiple items on which to perform an OR operation
     * @param queryArr A list of items on which to perform an OR operation.
     * @param exclude Used to filter out results matching the other criteria specified in this query.
     */
    static OR(queryArr: Array<BaseQuery | CombinedQuery>, exclude?: BaseQuery | CombinedQuery): CombinedQuery;
}
/**
 * @class ComplexArticleQuery
 * Create an article query using a complex query
 */
export declare class ComplexArticleQuery extends QueryCore {
    protected queryObj: any;
    /**
     * @param query An instance of CombinedQuery or BaseQuery to use to find articles that match the conditions
     * @param args Object which contains a host of optional parameters
     */
    constructor(query: CombinedQuery | BaseQuery, args?: ER.Query.ComplexArticleQueryArguments);
}
/**
 * @class ComplexEventQUery
 */
export declare class ComplexEventQuery extends QueryCore {
    /**
     * @param query an instance of CombinedQuery or BaseQuery to use to find events that match the conditions
     */
    constructor(query: BaseQuery | CombinedQuery);
}
