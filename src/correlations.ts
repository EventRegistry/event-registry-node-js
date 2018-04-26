import * as _ from "lodash";
import { QueryParamsBase } from "./base";
import { GetCounts } from "./counts";
import { EventRegistry } from "./eventRegistry";
import { GetCategoryInfo, GetConceptInfo } from "./info";
import { QueryArticles, RequestArticlesConceptAggr, RequestArticlesTimeAggr } from "./queryArticles";
import { ReturnInfo } from "./returnInfo";
import { ER } from "./types";

/**
 * @class GetTopCorrelations
 * Provides classes needed to identify concepts or categories
 * that trend the most with a concept, category or a custom time series
 */
export class GetTopCorrelations extends QueryParamsBase {
    private er: EventRegistry;
    constructor(er: EventRegistry) {
        super();
        this.er = er;
        this.setVal("action", "findTopCorrelations");
    }

    public get path() {
        return "/json/correlate";
    }
    /**
     * Specify the user defined array of input data
     * @param inputDataArr: array of tuples (date, val) where date is a date object or string in YYYY-MM-DD format and val is the value/counts for that date
     */
    public setCustomInputData(inputDataArr) {
        this.clearVal("testData");
        for (const {date, val} of inputDataArr) {
            if (!_.isNumber(val)) {
                throw new Error("Value is expected to be a number");
            }
            this.addArrayVal("testData", {date: QueryParamsBase.encodeDateTime(date), count: val});
        }
    }

    /**
     * Use the queryArticles to find articles that match the criteria. For the articles that match
     * criteria in queryArticles compute the time-series (number of resulting articles for each date)
     * an use the time series as the input data.
     * @param queryArticles An instance of QueryArticles class, containing the conditions that are use to find the matching time-series. You don't need to specify any requested result.
     */
    public async loadInputDataWithQuery(queryArticles: QueryArticles) {
        this.clearVal("testData");
        if (!(queryArticles instanceof QueryArticles)) {
            throw new Error("'queryArticles' expected to be an instance of QueryArticles");
        }
        const requestArticlesTimeAggr = new RequestArticlesTimeAggr();
        queryArticles.setRequestedResult(requestArticlesTimeAggr);
        const response = await this.er.execQuery(queryArticles);
        if (_.has(response, "timeAggr")) {
            // Potential issue if response["timeAggr"] is an object
            for (const object of response["timeAggr"]) {
                this.addArrayVal("testData", JSON.stringify(object));
            }
        }
    }

    /**
     * Use GetCounts class to obtain daily counts information for concept/category of interest.
     * @param getCounts An instance of GetCounts class.
     */
    public async loadInputDataWithCounts(getCounts: GetCounts) {
        this.clearVal("testData");
        if (!(getCounts instanceof GetCounts)) {
            throw new Error("'getCounts' is expected to be an instance of GetCounts");
        }
        const response = await this.er.execQuery(getCounts);

        if (_.size(response) > 1) {
            throw new Error("The returned object had multiple keys. When creating the GetCounts instance use only one uri.");
        }
        if (_.isEmpty(response)) {
            throw new Error("Obtained an empty object");
        }
        if (_.has(response, "error")) {
            throw new Error(_.get(response, "error"));
        }

        const key = _.first(_.keys(response));
        if (!_.isArray(response[key])) {
            throw new Error("Expected an array");
        }
        for (const object of response[key]) {
            this.addArrayVal("testData", JSON.stringify(object));
        }
    }

    /**
     * Do we have valid input data (needed before we can compute correlations)
     */
    public hasValidInputData() {
        return this.hasVal("testData");
    }

    /**
     * Compute concepts that correlate the most with the input data. If candidateConceptsQuery is provided we first identify the
     * concepts that are potentially returned as top correlations. Candidates are obtained by making the query and analyzing the
     * concepts that appear in the resulting articles. The top concepts are used as candidates among which we return the top correlations.
     * If conceptType is provided then only concepts of the specified type can be provided as the result.
     *
     * @param args Object which contains a host of optional parameters
     */
    public async getTopConceptCorrelations(args: ER.Correlations.TopConceptArguments = {}) {
        const { candidateConceptsQuery = undefined, candidatesPerType = 1000, conceptType = undefined, exactCount = 10, approxCount = 0, returnInfo = new ReturnInfo()} = args;
        this.clearVal("contextConceptIds");
        // Generate all necessary parameters (but don't update the params)
        const getTopCorrelations = _.cloneDeep(this);
        if (!_.isUndefined(candidateConceptsQuery)) {
            if (!(candidateConceptsQuery instanceof (QueryArticles))) {
                throw new Error("'candidateConceptsQuery' is expected to be of type QueryArticles");
            }
            candidateConceptsQuery.setRequestedResult(new RequestArticlesConceptAggr());
            candidateConceptsQuery.setVal("conceptAggrConceptCountPerType", candidatesPerType);
            candidateConceptsQuery.setVal("conceptAggrConceptIdOnly", true);
            const response = await this.er.execQuery(candidateConceptsQuery);
            if (_.has(response, "conceptAggr")) {
                getTopCorrelations.setVal("contextConceptIds", _.join(response["conceptAggr"], ","));
            } else {
                console.warn("Warning: Failed to compute a candidate set of concepts");
            }
        }

        if (conceptType) {
            getTopCorrelations.setVal("conceptType", conceptType);
        }
        getTopCorrelations.setVal("exactCount", exactCount);
        getTopCorrelations.setVal("approxCount", approxCount);
        getTopCorrelations.setVal("sourceType", "news-concept");

        const res = await this.er.jsonRequest(this.path, getTopCorrelations.params);

        if (!_.isUndefined(returnInfo)) {
            const corrs = [..._.get(res, "news-concept.exactCorrelations", []), ..._.get(res, "news-concept.approximateCorrelations", [])];
            const conceptIds = _.map(corrs, "id");
            let conceptInfos = {};
            for (const i of _.range(0, _.size(conceptIds), 500)) {
                const ids = _.slice(conceptIds, i, i + 500);
                const q = new GetConceptInfo({returnInfo});
                // @ts-ignore
                q.queryById(ids);
                const info = await this.er.execQuery(q);
                conceptInfos = _.extend({}, conceptInfos, info);
            }
            if (_.has(res, "news-concept.exactCorrelations")) {
                _.update(res, "news-concept.exactCorrelations", (items) => {
                    return _.map(items, (item) => {
                        item["conceptInfo"] = _.get(conceptInfos, item["id"], {});
                        return item;
                    });
                });
            }
            if (_.has(res, "news-concept.approximateCorrelations")) {
                _.update(res, "news-concept.approximateCorrelations", (items) => {
                    return _.map(items, (item) => {
                        item["conceptInfo"] = _.get(conceptInfos, item["id"], {});
                        return item;
                    });
                });
            }
        }
        return res as any;
    }
    /**
     * Compute categories that correlate the most with the input data.
     * @param args Object which contains a host of optional parameters
     */
    public async getTopCategoryCorrelations(args: ER.Correlations.TopCategoryArguments = {}) {
        const {exactCount = 10, approxCount = 0, returnInfo = new ReturnInfo()} = args;
        const getTopCorrelations = _.cloneDeep(this);
        getTopCorrelations.clearVal("contextConceptIds");
        getTopCorrelations.setVal("exactCount", exactCount);
        getTopCorrelations.setVal("approxCount", approxCount);
        getTopCorrelations.setVal("sourceType", "news-category");

        const res = await this.er.jsonRequest(this.path, getTopCorrelations.params);

        if (!_.isUndefined(returnInfo)) {
            const corrs = [..._.get(res, "news-category.exactCorrelations", []), ..._.get(res, "news-category.approximateCorrelations", [])];
            const categoryIds = _.map(corrs, "id");
            let categoryInfos = {};
            for (const i of _.range(0, _.size(categoryIds), 500)) {
                const ids = _.slice(categoryIds, i, i + 500);
                const q = new GetCategoryInfo({ returnInfo });
                // @ts-ignore
                q.queryById(ids);
                const info = this.er.execQuery(q);
                categoryInfos = _.extend({}, categoryInfos, info);
            }
            if (_.has(res, "news-category.exactCorrelations")) {
                _.update(res, "news-category.exactCorrelations", (items) => {
                    return _.map(items, (item) => {
                        item["categoryInfo"] = _.get(categoryInfos, item["id"], {});
                        return item;
                    });
                });
            }
            if (_.has(res, "news-category.approximateCorrelations")) {
                _.update(res, "news-category.approximateCorrelations", (items) => {
                    return _.map(items, (item) => {
                        item["categoryInfo"] = _.get(categoryInfos, item["id"], {});
                        return item;
                    });
                });
            }
        }
        return res as any;
    }
}
