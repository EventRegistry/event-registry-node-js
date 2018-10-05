import * as _ from "lodash";
import { EventRegistry } from "./eventRegistry";
import { EventRegistryStatic } from "./types";

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

    /**
     * Create a new topic and train it using the tweets that match the twitterQuery
     * @param twitterQuery string containing the content to search for. It can be a Twitter user account (using "@" prefix or user's Twitter url),a hash tag (using "#" prefix) or a regular keyword.
     * @param args Object which contains a host of optional parameters
     */
    public async trainTopicOnTweets(twitterQuery: string, args: EventRegistryStatic.Analytics.TrainTopicOnTweetsArguments = {}) {
        const {
            useTweetText = true,
            maxConcepts = 20,
            maxCategories = 10,
            maxTweets = 2000,
            notifyEmailAddress = undefined,
        } = args;
        if (maxTweets > 5000) {
            throw new Error("We can analyze at most 5000 tweets");
        }
        const params = {twitterQuery, useTweetText, maxConcepts, maxCategories, maxTweets};
        if (notifyEmailAddress) {
            _.set(params, "notifyEmailAddress", notifyEmailAddress);
        }
        return _.get(await this.er.jsonRequestAnalytics("/api/v1/trainTopicOnTwitter",  params), "data");
    }

    /**
     * Create a new topic to train. The user should remember the "uri" parameter returned in the result.
     * @param name name of the topic we want to create
     * @returns object containing the "uri" property that should be used in the follow-up call to trainTopic* methods
     */
    public async trainTopicCreateTopic(name: string) {
        return _.get(await this.er.jsonRequestAnalytics("/api/v1/trainTopic", { action: "createTopic", name: name}), "data");
    }

    /**
     * Add the information extracted from the provided "text" to the topic with uri "uri".
     * @param uri uri of the topic (obtained by calling trainTopicCreateTopic method)
     * @param text text to analyze and extract information from
     */
    public async trainTopicAddDocument(uri: string, text: string) {
        return _.get(await this.er.jsonRequestAnalytics("/api/v1/trainTopic", { action: "addDocument", uri: uri, text: text}), "data");
    }

    /**
     * Add the information extracted from the provided "text" to the topic with uri "uri".
     * @param uri uri of the topic (obtained by calling trainTopicCreateTopic method)
     * @param args Object which contains a host of optional parameters
     * @returns returns the trained topic: { concepts: [], categories: [] }
     */
    public async trainTopicFinishTraining(uri: string, args: EventRegistryStatic.Analytics.TrainTopicFinishTrainingArguments = {}) {
        const {
            maxConcepts = 20,
            maxCategories = 10,
            idfNormalization = true,
        } = args;
        const params = {
            action: "finishTraining",
            uri: uri,
            maxConcepts: maxConcepts,
            maxCategories: maxCategories,
            idfNormalization: idfNormalization,
        };
        return _.get(await this.er.jsonRequestAnalytics("/api/v1/trainTopic", params), "data");
    }

    /**
     * Retrieve topic for the topic for which you have already finished training
     * @param uri uri of the topic (obtained by calling trainTopicCreateTopic method)
     * @returns returns the trained topic: { concepts: [], categories: [] }
     */
    public async trainTopicGetTrainedTopic(uri: string) {
        return _.get(await this.er.jsonRequestAnalytics("/api/v1/trainTopic", { action: "getTrainedTopic", uri: uri }), "data");
    }
}
