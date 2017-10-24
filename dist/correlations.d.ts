import { QueryParamsBase } from "./base";
import { GetCounts } from "./counts";
import { EventRegistry } from "./eventRegistry";
import { QueryArticles } from "./queryArticles";
import { ER } from "./types";
/**
 * @class GetTopCorrelations
 * Provides classes needed to identify concepts or categories
 * that trend the most with a concept, category or a custom time series
 */
export declare class GetTopCorrelations extends QueryParamsBase {
    private er;
    constructor(er: EventRegistry);
    readonly path: string;
    /**
     * Specify the user defined array of input data
     * @param inputDataArr: array of tuples (date, val) where date is a date object or string in YYYY-MM-DD format and val is the value/counts for that date
     */
    setCustomInputData(inputDataArr: any): void;
    /**
     * Use the queryArticles to find articles that match the criteria. For the articles that match
     * criteria in queryArticles compute the time-series (number of resulting articles for each date)
     * an use the time series as the input data.
     * @param queryArticles An instance of QueryArticles class, containing the conditions that are use to find the matching time-series. You don't need to specify any requested result.
     */
    loadInputDataWithQuery(queryArticles: QueryArticles): Promise<void>;
    /**
     * Use GetCounts class to obtain daily counts information for concept/category of interest.
     * @param getCounts An instance of GetCounts class.
     */
    loadInputDataWithCounts(getCounts: GetCounts): Promise<void>;
    /**
     * Do we have valid input data (needed before we can compute correlations)
     */
    hasValidInputData(): boolean;
    /**
     * Compute concepts that correlate the most with the input data. If candidateConceptsQuery is provided we first identify the
     * concepts that are potentially returned as top correlations. Candidates are obtained by making the query and analyzing the
     * concepts that appear in the resulting articles. The top concepts are used as candidates among which we return the top correlations.
     * If conceptType is provided then only concepts of the specified type can be provided as the result.
     *
     * @param args Object which contains a host of optional parameters
     */
    getTopConceptCorrelations(args?: ER.Correlations.TopConceptArguments): Promise<any>;
    /**
     * Compute categories that correlate the most with the input data.
     * @param args Object which contains a host of optional parameters
     */
    getTopCategoryCorrelations(args?: ER.Correlations.TopCategoryArguments): Promise<any>;
}
