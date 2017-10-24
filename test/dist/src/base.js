"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
var moment = require("moment");
exports.mainLangs = ["eng", "deu", "zho", "slv", "spa"];
exports.allLangs = ["eng", "deu", "spa", "cat", "por", "ita", "fra", "rus", "ara", "tur", "zho", "slv", "hrv", "srp"];
// Utility classes for Event Registry
var QueryItems = /** @class */ (function () {
    function QueryItems(oper, items) {
        this.oper = oper;
        this.items = items;
    }
    QueryItems.prototype.getOper = function () {
        return this.oper;
    };
    QueryItems.prototype.getItems = function () {
        return this.items;
    };
    QueryItems.AND = function (items) { return new QueryItems("$and", items); };
    QueryItems.OR = function (items) { return new QueryItems("$or", items); };
    return QueryItems;
}());
exports.QueryItems = QueryItems;
/**
 * @class QueryParamsBase
 * Base class for Query and AdminQuery
 * used for storing parameters for a query. Parameter values can either be
 * simple values (set by setVal()) or an array of values (set by multiple
 * calls to addArrayVal() method)
 */
var QueryParamsBase = /** @class */ (function () {
    function QueryParamsBase() {
        this.params = {};
    }
    /**
     * Encode datetime into UTC ISO format which can be sent to ER.
     */
    QueryParamsBase.encodeDateTime = function (val, format) {
        var datetime = moment.utc(val);
        if (!datetime.isValid()) {
            throw new Error("Datetime was not recognizable. Use `new Date()` or string in ISO format");
        }
        return _.isNil(format) ? datetime.toISOString() : datetime.format(format);
    };
    /**
     * Return the parameters.
     */
    QueryParamsBase.prototype.getQueryParams = function () {
        return this.params;
    };
    /**
     * Set a value of a property in the query.
     */
    QueryParamsBase.prototype.setVal = function (key, value) {
        _.set(this.params, key, value);
    };
    /**
     * Do we have in the query property named 'key'?
     */
    QueryParamsBase.prototype.hasVal = function (key) {
        return _.has(this.params, key);
    };
    /**
     * Remove the value of a property key (if existing).
     */
    QueryParamsBase.prototype.clearVal = function (key) {
        _.unset(this.params, key);
    };
    /**
     * Add a value to an array of values for a property.
     */
    QueryParamsBase.prototype.addArrayVal = function (key, val) {
        _.update(this.params, key, function (value) { return (value || []).concat([val]); });
    };
    /**
     * Set value in query params if the 'val' is different from 'defVal'.
     */
    QueryParamsBase.prototype.setValIfNotDefault = function (propName, val, defVal) {
        if (val !== defVal) {
            this.setVal(propName, val);
        }
    };
    /**
     * Set a property value that represents date.
     * Value can be string in YYYY-MM-DD format or a Date object.
     */
    QueryParamsBase.prototype.setDateVal = function (propName, val) {
        this.setVal(propName, QueryParamsBase.encodeDateTime(val, "YYYY-MM-DD"));
    };
    return QueryParamsBase;
}());
exports.QueryParamsBase = QueryParamsBase;
var Query = /** @class */ (function (_super) {
    __extends(Query, _super);
    function Query() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.params = {};
        return _this;
    }
    /**
     * Prepare the request parameters
     */
    Query.prototype.getQueryParams = function () {
        if (_.isEmpty(this.resultTypeList)) {
            throw new Error("The query does not have any result type specified. No sense in performing such a query");
        }
        var allParams = this.params;
        _.each(this.resultTypeList, function (resultType) {
            _.extend(allParams, _.get(resultType, "params"));
        });
        _.set(allParams, "resultType", this.formattedResultTypeList);
        return allParams;
    };
    Object.defineProperty(Query.prototype, "formattedResultTypeList", {
        get: function () {
            if (_.size(this.resultTypeList) === 1) {
                return _.get(_.first(this.resultTypeList), "resultType");
            }
            else {
                return _.map(this.resultTypeList, "resultType");
            }
        },
        enumerable: true,
        configurable: true
    });
    Query.prototype.clearRequestedResults = function () {
        this.resultTypeList = [];
    };
    /**
     * Parse the value "value" and use it to set the property propName and the operator with name propOperName
     * @param value String, QueryItems or an array.
     * @param propName Values to be set using property name propName.
     * @param propOperName Property to set containing the "and" or "or". Relevant only if multiple items are provided in "value". Can be None if only one value is possible.
     * @param defaultOperName Which operator should be used in case "value" is an array. If an array, we will print also a warning to suggest use of QueryItems.
     */
    Query.prototype.setQueryArrVal = function (value, propName, propOperName, defaultOperName) {
        if (!value) {
            return;
        }
        if (value instanceof QueryItems) {
            this.params[propName] = value.getItems();
            var formattedOperator = _.replace(value.getOper(), "$", "");
            if (propOperName) {
                this.params[propOperName] = formattedOperator;
            }
            if (_.isUndefined(propOperName) || formattedOperator !== defaultOperName) {
                throw new Error("An invalid operator type '" + formattedOperator + "' was used for property '" + propName + "'");
            }
        }
        else if (_.isString(value)) {
            this.params[propName] = value;
        }
        else if (_.isArray(value)) {
            this.params[propName] = value;
            if (!_.isUndefined(propOperName)) {
                this.params[propOperName] = defaultOperName;
                if (_.size(value) > 1) {
                    console.warn("\n                        Warning: The value of parameter '" + propName + "' was provided as a list and '" + defaultOperName + "' operator was used implicitly between the items.\n                        We suggest specifying the list using the QueryItems.AND() or QueryItems.OR() to ensure the appropriate operator is used.\n                    ");
                }
            }
        }
        else {
            throw new Error("Parameter '" + propName + "' was of unsupported type. It should either be None, a string or an instance of QueryItems");
        }
    };
    return Query;
}(QueryParamsBase));
exports.Query = Query;
/**
 * Utility function used in conjunction with a async/await and/or Promise
 */
function sleep(ms) {
    return new Promise(function (resolve) {
        setTimeout(resolve, ms);
    });
}
exports.sleep = sleep;
//# sourceMappingURL=base.js.map