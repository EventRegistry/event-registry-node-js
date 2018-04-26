import * as _ from "lodash";
import { EventRegistry } from "./eventRegistry";

// The Analytics class can be used for access the text analytics services provided by the Event Registry.
// These include:
// - text annotation: identifying the list of entities and non-entities mentioned in the provided text
// - text categorization: identification of up to 5 categories that describe the topic of the given text.
//     The list of available categories come from DMOZ open directory. Currently, only English text can be categorized!
// - sentiment detection: what is the sentiment expressed in the given text
// - language detection: detect in which language is the given text written

// NOTE: the functionality is currently in BETA. The API calls or the provided outputs may change in the future.

export class Analytics {
    /**
     * @param eventRegistry: instance of EventRegistry class
     */
    constructor(private er: EventRegistry) { }

    /**
     * Identify the list of entities and nonentities mentioned in the text
     * @param text input text to annotate
     * @param lang language of the provided document (can be an ISO2 or ISO3 code). If None is provided, the language will be automatically detected
     */
    public async annotate(text: string, lang?: string[]) {
        return _.get(await this.er.jsonRequestAnalytics("/api/v1/annotate",  { lang, text }), "data");
    }

    /**
     * Determine the set of up to 5 categories the text is about. Currently, only English text can be categorized!
     * @param text input text to categorize
     */
    public async categorize(text: string) {
        return _.get(await this.er.jsonRequestAnalytics("/api/v1/categorize",  { text }), "data");
    }

    /**
     * Determine the sentiment of the provided text
     * @param text input text to categorize
     */
    public async sentiment(text: string) {
        return _.get(await this.er.jsonRequestAnalytics("/api/v1/sentiment",  { text }), "data");
    }

    public async semanticSimilarity(text1: string, text2: string, distanceMeasure: "cosine" | "jaccard" = "cosine") {
        return _.get(await this.er.jsonRequestAnalytics("/api/v1/semanticSimilarity",  { text1, text2, distanceMeasure }), "data");
    }

    /**
     * Determine the language of the given text
     * @param text input text to analyse
     */
    public async detectLanguage(text: string) {
        return _.get(await this.er.jsonRequestAnalytics("/api/v1/detectLanguage",  { text }), "data");
    }
    /**
     * Extract all available information about an article available at url `url`.
     * Returned information will include article title, body, authors, links in the articles,...
     * @param url article url that'll be used for extraction
     */
    public async extractArticleInfo(url: string) {
        return _.get(await this.er.jsonRequestAnalytics("/api/v1/extractArticleInfo",  { url }), "data");
    }
}
