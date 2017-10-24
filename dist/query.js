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
var base_1 = require("./base");
var QueryCore = /** @class */ (function () {
    function QueryCore() {
        this.queryObj = {};
    }
    QueryCore.prototype.getQuery = function () {
        return this.queryObj;
    };
    QueryCore.prototype.setQueryParam = function (paramName, val) {
        this.queryObj[paramName] = val;
    };
    QueryCore.prototype.setValIfNotDefault = function (propName, value, defVal) {
        if (value !== defVal) {
            this.queryObj[propName] = value;
        }
    };
    return QueryCore;
}());
exports.QueryCore = QueryCore;
var BaseQuery = /** @class */ (function (_super) {
    __extends(BaseQuery, _super);
    /**
     * @param args Object which contains a host of optional parameters
     */
    function BaseQuery(args) {
        if (args === void 0) { args = {}; }
        var _this = _super.call(this) || this;
        _.defaults(args, {
            keywordLoc: "body",
            categoryIncludeSub: true,
        });
        _this.setQueryArrVal("keyword", args.keyword);
        _this.setQueryArrVal("conceptUri", args.conceptUri);
        _this.setQueryArrVal("categoryUri", args.categoryUri);
        _this.setQueryArrVal("sourceUri", args.sourceUri);
        _this.setQueryArrVal("locationUri", args.locationUri);
        _this.setQueryArrVal("lang", args.lang);
        if (!_.isNil(args.dateStart)) {
            _this.queryObj["dateStart"] = base_1.QueryParamsBase.encodeDateTime(args.dateStart, "YYYY-MM-DD");
        }
        if (!_.isNil(args.dateEnd)) {
            _this.queryObj["dateEnd"] = base_1.QueryParamsBase.encodeDateTime(args.dateEnd, "YYYY-MM-DD");
        }
        if (!_.isNil(args.dateMention)) {
            if (_.isArray(args.dateMention)) {
                _this.queryObj["dateMention"] = _.map(args.dateMention, function (date) { return base_1.QueryParamsBase.encodeDateTime(date, "YYYY-MM-DD"); });
            }
            else {
                _this.queryObj["dateMention"] = base_1.QueryParamsBase.encodeDateTime(args.dateMention, "YYYY-MM-DD");
            }
        }
        _this.setQueryArrVal("sourceLocationUri", args.sourceLocationUri);
        _this.setQueryArrVal("sourceGroupUri", args.sourceGroupUri);
        if (!args.categoryIncludeSub) {
            _this.queryObj["categoryIncludeSub"] = false;
        }
        if (args.keywordLoc !== "body") {
            _this.queryObj["keywordLoc"] = args.keywordLoc;
        }
        if (!_.isNil(args.minMaxArticlesInEvent)) {
            if (!_.isArray() || _.size(args.minMaxArticlesInEvent) !== 2) {
                throw new Error("minMaxArticlesInEvent parameter should either be None or a tuple with two integer values");
            }
            _this.queryObj["minArticlesInEvent"] = args.minMaxArticlesInEvent[0];
            _this.queryObj["maxArticlesInEvent"] = args.minMaxArticlesInEvent[1];
        }
        if (!_.isNil(args.exclude)) {
            if (!(args.exclude instanceof QueryCore)) {
                throw new Error("exclude parameter was not a CombinedQuery or BaseQuery instance");
            }
            _this.queryObj["$not"] = args.exclude.getQuery();
        }
        return _this;
    }
    BaseQuery.prototype.setQueryArrVal = function (propName, value) {
        if (_.isNil(value)) {
            return;
        }
        if (value instanceof base_1.QueryItems) {
            _.set(this.queryObj, propName + "." + value.getOper(), value.getItems());
        }
        else if (_.isString(value)) {
            _.set(this.queryObj, propName, value);
        }
        else {
            throw new Error("Parameter '" + propName + "' was of unsupported type. It should either be undefined, a string or an instance of QueryItems");
        }
    };
    return BaseQuery;
}(QueryCore));
exports.BaseQuery = BaseQuery;
var CombinedQuery = /** @class */ (function (_super) {
    __extends(CombinedQuery, _super);
    function CombinedQuery() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Create a combined query with multiple items on which to perform an AND operation
     * @param queryArr a list of items on which to perform an AND operation. Items can be either a CombinedQuery or BaseQuery instances.
     * @param exclude Used to filter out results matching the other criteria specified in this query
     */
    CombinedQuery.AND = function (queryArr, exclude) {
        if (!_.isArray(queryArr)) {
            throw new Error("provided argument as not a list");
        }
        if (_.isEmpty(queryArr)) {
            throw new Error("queryArr had an empty list");
        }
        var query = new CombinedQuery();
        query.queryObj["$and"] = [];
        _.each(queryArr, function (item) {
            if (!(item instanceof QueryCore)) {
                throw new Error("item in the list was not a CombinedQuery or BaseQuery instance");
            }
            query.queryObj["$and"] = query.queryObj["$and"].concat([item.getQuery()]);
        });
        if (!_.isNil(exclude)) {
            if (!(exclude instanceof QueryCore)) {
                throw new Error("exclude parameter was not a CombinedQuery or BaseQuery instance");
            }
            query.setQueryParam("$not", exclude.getQuery());
        }
        return query;
    };
    /**
     * Create a combined query with multiple items on which to perform an OR operation
     * @param queryArr A list of items on which to perform an OR operation.
     * @param exclude Used to filter out results matching the other criteria specified in this query.
     */
    CombinedQuery.OR = function (queryArr, exclude) {
        if (!_.isArray(queryArr)) {
            throw new Error("provided argument as not a list");
        }
        if (_.isEmpty(queryArr)) {
            throw new Error("queryArr had an empty list");
        }
        var query = new CombinedQuery();
        query.queryObj["$or"] = [];
        _.each(queryArr, function (item) {
            if (!(item instanceof QueryCore)) {
                throw new Error("item in the list was not a CombinedQuery or BaseQuery instance");
            }
            query.queryObj["$or"] = query.queryObj["$or"].concat([item.getQuery()]);
        });
        if (!_.isNil(exclude)) {
            if (!(exclude instanceof QueryCore)) {
                throw new Error("exclude parameter was not a CombinedQuery or BaseQuery instance");
            }
            query.setQueryParam("$not", exclude.getQuery());
        }
        return query;
    };
    return CombinedQuery;
}(QueryCore));
exports.CombinedQuery = CombinedQuery;
/**
 * @class ComplexArticleQuery
 * Create an article query using a complex query
 */
var ComplexArticleQuery = /** @class */ (function (_super) {
    __extends(ComplexArticleQuery, _super);
    /**
     * @param query An instance of CombinedQuery or BaseQuery to use to find articles that match the conditions
     * @param args Object which contains a host of optional parameters
     */
    function ComplexArticleQuery(query, args) {
        if (args === void 0) { args = {}; }
        var _this = _super.call(this) || this;
        _.defaults(args, {
            isDuplicateFilter: "keepAll",
            hasDuplicateFilter: "keepAll",
            eventFilter: "keepAll",
        });
        if (!(query instanceof QueryCore)) {
            throw new Error("query parameter was not a CombinedQuery or BaseQuery instance");
        }
        _this.queryObj["$query"] = query.getQuery();
        var filter = {};
        if (_.get(args, "isDuplicateFilter") !== "keepAll") {
            filter["isDuplicate"] = _.get(args, "isDuplicateFilter");
        }
        if (_.get(args, "hasDuplicateFilter") !== "keepAll") {
            filter["hasDuplicate"] = _.get(args, "hasDuplicateFilter");
        }
        if (_.get(args, "eventFilter") !== "keepAll") {
            filter["hasEvent"] = _.get(args, "eventFilter");
        }
        if (_.isEmpty(filter)) {
            _this.queryObj["$filter"] = filter;
        }
        return _this;
    }
    return ComplexArticleQuery;
}(QueryCore));
exports.ComplexArticleQuery = ComplexArticleQuery;
/**
 * @class ComplexEventQUery
 */
var ComplexEventQuery = /** @class */ (function (_super) {
    __extends(ComplexEventQuery, _super);
    /**
     * @param query an instance of CombinedQuery or BaseQuery to use to find events that match the conditions
     */
    function ComplexEventQuery(query) {
        var _this = _super.call(this) || this;
        if (!(query instanceof QueryCore)) {
            throw new Error("query parameter was not a CombinedQuery or BaseQuery instance");
        }
        _this.queryObj["$query"] = query.getQuery();
        return _this;
    }
    return ComplexEventQuery;
}(QueryCore));
exports.ComplexEventQuery = ComplexEventQuery;
