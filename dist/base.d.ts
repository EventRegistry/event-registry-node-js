export declare const mainLangs: string[];
export declare const allLangs: string[];
export declare class QueryItems {
    static AND: (items: any) => QueryItems;
    static OR: (items: any) => QueryItems;
    private oper;
    private items;
    constructor(oper: any, items: any);
    getOper(): any;
    getItems(): any;
}
/**
 * @class QueryParamsBase
 * Base class for Query and AdminQuery
 * used for storing parameters for a query. Parameter values can either be
 * simple values (set by setVal()) or an array of values (set by multiple
 * calls to addArrayVal() method)
 */
export declare class QueryParamsBase {
    protected params: {};
    /**
     * Encode datetime into UTC ISO format which can be sent to ER.
     */
    static encodeDateTime(val: string | Date, format?: string): string;
    /**
     * Return the parameters.
     */
    getQueryParams(): {};
    /**
     * Set a value of a property in the query.
     */
    setVal(key: any, value: any): void;
    /**
     * Do we have in the query property named 'key'?
     */
    hasVal(key: any): boolean;
    /**
     * Remove the value of a property key (if existing).
     */
    clearVal(key: any): void;
    /**
     * Add a value to an array of values for a property.
     */
    addArrayVal(key: any, val: any): void;
    /**
     * Set value in query params if the 'val' is different from 'defVal'.
     */
    setValIfNotDefault(propName: any, val: any, defVal: any): void;
    /**
     * Set a property value that represents date.
     * Value can be string in YYYY-MM-DD format or a Date object.
     */
    setDateVal(propName: any, val: any): void;
}
export declare abstract class Query<T> extends QueryParamsBase {
    abstract path: string;
    resultTypeList: T[];
    protected params: {};
    /**
     * Prepare the request parameters
     */
    getQueryParams(): {};
    readonly formattedResultTypeList: any;
    clearRequestedResults(): void;
    abstract setRequestedResult(args: any): any;
    /**
     * Parse the value "value" and use it to set the property propName and the operator with name propOperName
     * @param value String, QueryItems or an array.
     * @param propName Values to be set using property name propName.
     * @param propOperName Property to set containing the "and" or "or". Relevant only if multiple items are provided in "value". Can be None if only one value is possible.
     * @param defaultOperName Which operator should be used in case "value" is an array. If an array, we will print also a warning to suggest use of QueryItems.
     */
    protected setQueryArrVal(value: string | QueryItems | any[], propName: string, propOperName: string | undefined, defaultOperName: any): void;
}
/**
 * Utility function used in conjunction with a async/await and/or Promise
 */
export declare function sleep(ms: any): Promise<{}>;
