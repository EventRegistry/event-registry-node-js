import * as _ from "lodash";
import * as moment from "moment";
import { ReturnInfo } from "./returnInfo";

export const mainLangs = ["eng", "deu", "zho", "slv", "spa"];
export const allLangs = [ "eng", "deu", "spa", "cat", "por", "ita", "fra", "rus", "ara", "tur", "zho", "slv", "hrv", "srp" ];
// Utility classes for Event Registry

export class QueryItems {
    public static AND = (items) => new QueryItems("$and", items);
    public static OR = (items) => new QueryItems("$or", items);

    private oper;
    private items;

    constructor(oper, items) {
        this.oper = oper;
        this.items = items;
    }

    public getOper() {
        return this.oper;
    }

    public getItems() {
        return this.items;
    }

}
/**
 * @class QueryParamsBase
 * Base class for Query and AdminQuery
 * used for storing parameters for a query. Parameter values can either be
 * simple values (set by setVal()) or an array of values (set by multiple
 * calls to addArrayVal() method)
 */
export class QueryParamsBase {
    protected params = {};

    /**
     * Encode datetime into UTC ISO format which can be sent to ER.
     */
    public static encodeDateTime(val: string | Date, format?: string): string {
        const datetime = moment.utc(val);
        if (!datetime.isValid()) {
            throw new Error("Datetime was not recognizable. Use `new Date()` or string in ISO format");
        }
        return _.isNil(format) ? datetime.toISOString() : datetime.format(format);
    }

    /**
     * Return the parameters.
     */
    public getQueryParams() {
        return this.params;
    }

    /**
     * Set a value of a property in the query.
     */
    public setVal(key, value) {
        _.set(this.params, key, value);
    }

    /**
     * Do we have in the query property named 'key'?
     */
    public hasVal(key): boolean {
        return _.has(this.params, key);
    }

    /**
     * Remove the value of a property key (if existing).
     */
    public clearVal(key) {
        _.unset(this.params, key);
    }

    /**
     * Add a value to an array of values for a property.
     */
    public addArrayVal(key, val) {
        _.update(this.params, key, (value) => [...(value || []), val]);
    }

    /**
     * Set value in query params if the 'val' is different from 'defVal'.
     */
    public setValIfNotDefault(propName, val, defVal) {
        if (val !== defVal) {
            this.setVal(propName, val);
        }
    }

    /**
     * Set a property value that represents date.
     * Value can be string in YYYY-MM-DD format or a Date object.
     */
    public setDateVal(propName, val) {
        this.setVal(propName, QueryParamsBase.encodeDateTime(val, "YYYY-MM-DD"));
    }
}

export abstract class Query<T> extends QueryParamsBase {
    public abstract path: string;
    public resultTypeList: T[];
    protected params = {};

    /**
     * Prepare the request parameters
     */
    public getQueryParams() {
        if (_.isEmpty(this.resultTypeList)) {
            throw new Error("The query does not have any result type specified. No sense in performing such a query");
        }
        const allParams = this.params;
        _.each(this.resultTypeList, (resultType) => {
            _.extend(allParams, _.get(resultType, "params"));
        });
        _.set(allParams, "resultType", this.formattedResultTypeList);
        return allParams;
    }

    public get formattedResultTypeList() {
        if (_.size(this.resultTypeList) === 1) {
            return _.get(_.first(this.resultTypeList), "resultType");
        } else {
            return _.map(this.resultTypeList, "resultType");
        }
    }

    public abstract setRequestedResult(args);

    /**
     * Parse the value "value" and use it to set the property propName and the operator with name propOperName
     * @param value String, QueryItems or an array.
     * @param propName Values to be set using property name propName.
     * @param propOperName Property to set containing the "and" or "or". Relevant only if multiple items are provided in "value". Can be None if only one value is possible.
     * @param defaultOperName Which operator should be used in case "value" is an array. If an array, we will print also a warning to suggest use of QueryItems.
     */
    protected setQueryArrVal(value: string | QueryItems | any[], propName: string, propOperName: string | undefined, defaultOperName) {
        if (!value) {
            return;
        }

        if (value instanceof QueryItems) {
            this.params[propName] = value.getItems();
            const formattedOperator = _.replace(value.getOper(), "$", "");
            if (propOperName) {
                this.params[propOperName] = formattedOperator;
            }
            if (_.isUndefined(propOperName) && formattedOperator !== defaultOperName) {
                throw new Error(`An invalid operator type '${formattedOperator}' was used for property '${propName}'`);
            }
        } else if (_.isString(value)) {
            this.params[propName] = value;
        } else if (_.isArray(value)) {
            this.params[propName] = value;
            if (!_.isUndefined(propOperName)) {
                this.params[propOperName] = defaultOperName;
                if (_.size(value) > 1) {
                    console.warn(`
                        Warning: The value of parameter '${propName}' was provided as a list and '${defaultOperName}' operator was used implicitly between the items.
                        We suggest specifying the list using the QueryItems.AND() or QueryItems.OR() to ensure the appropriate operator is used.
                    `);
                }
            }
        } else {
            throw new Error(`Parameter '${propName}' was of unsupported type. It should either be None, a string or an instance of QueryItems`);
        }
    }

}

/**
 * Utility function used in conjunction with a async/await and/or Promise
 */
export function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
