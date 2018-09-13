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
     * @param taxonomy: which taxonomy use for categorization. Options:
     *  - "dmoz" (over 5000 categories in 3 levels, English language only)
     *  - "news" (general news categorization, 9 categories, any langauge)
     */
    public async categorize(text: string, taxonomy: "dmoz" | "news" = "dmoz") {
        return _.get(await this.er.jsonRequestAnalytics("/api/v1/categorize",  { text, taxonomy }), "data");
    }

    /**
     * determine the sentiment of the provided text in English language
     * @param text input text to categorize
     * @param method method to use to compute the sentiment. possible values are "vocabulary" (vocabulary based sentiment analysis) and "rnn" (neural network based sentiment classification)
     */
    public async sentiment(text: string, method = "vocabulary") {
        if (!_.includes(["vocabulary", "rnn"], method)) {
            throw new Error("method: Please pass in either 'vocabulary' or 'rnn'");
        }
        return _.get(await this.er.jsonRequestAnalytics(`/api/v1/${method === "vocabulary" ? "sentiment" : "sentimentRNN"}`,  { text }), "data");
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
     * @param proxyUrl proxy that should be used for downloading article information. format: {schema}://{username}:{pass}@{proxy url/ip}
     */
    public async extractArticleInfo(url: string, proxyUrl?: string) {
        const params = { url };
        if (proxyUrl) {
            _.set(params, "proxyUrl", proxyUrl);
        }
        return _.get(await this.er.jsonRequestAnalytics("/api/v1/extractArticleInfo", params), "data");
    }

    /**
     * Extract named entities from the provided text. Supported languages are English, German, Spanish and Chinese.
     * @param text: text on which to extract named entities
     */
    public async ner(text: string) {
        return _.get(await this.er.jsonRequestAnalytics("/api/v1/ner",  { text }), "data");
    }
}
