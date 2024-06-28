import { EventRegistry } from "./eventRegistry";
import { ER } from "./types";

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
    public async annotate(text: string, lang?: string[], customParams?: {[name: string]: unknown}): Promise<ER.Analytics.Response.Annotate> {
        let params = { lang, text };
        if (!!customParams) {
            params = {...params, ...customParams};
        }
        const response = await this.er.jsonRequestAnalytics("/api/v1/annotate", params);
        return response?.data as ER.Analytics.Response.Annotate;
    }

    /**
     * Determine the set of up to 5 categories the text is about. Currently, only English text can be categorized!
     * @param text input text to categorize
     * @param taxonomy: which taxonomy use for categorization. Options:
     *  - "dmoz" (over 5000 categories in 3 levels, English language only)
     *  - "news" (general news categorization, 9 categories, any langauge)
     */
    public async categorize(text: string, taxonomy: "dmoz" | "news" = "dmoz"): Promise<ER.Analytics.Response.Categorize> {
        const response = await this.er.jsonRequestAnalytics("/api/v1/categorize", { text, taxonomy });
        return response?.data as ER.Analytics.Response.Categorize;
    }

    /**
     * determine the sentiment of the provided text in English language
     * @param text input text to categorize
     * @param method method to use to compute the sentiment. possible values are "vocabulary" (vocabulary based sentiment analysis) and "rnn" (neural network based sentiment classification)
     */
    public async sentiment(text: string, method = "vocabulary", sentences = 10, returnSentences = true): Promise<ER.Analytics.Response.Sentiment> {
        if (!["vocabulary", "rnn"].includes(method)) {
            throw new Error("method: Please pass in either 'vocabulary' or 'rnn'");
        }
        const params = {
            text,
            method,
            sentences,
            returnSentences,
        };
        const response = await this.er.jsonRequestAnalytics("/api/v1/sentiment", params);
        return response?.data as ER.Analytics.Response.Sentiment;
    }

    public async semanticSimilarity(text1: string, text2: string, distanceMeasure: "cosine" | "jaccard" = "cosine"): Promise<ER.Analytics.Response.SentimentSimilarity> {
        const response = await this.er.jsonRequestAnalytics("/api/v1/semanticSimilarity", { text1, text2, distanceMeasure });
        return response?.data as ER.Analytics.Response.SentimentSimilarity;
    }

    /**
     * Determine the language of the given text
     * @param text input text to analyse
     */
    public async detectLanguage(text: string): Promise<ER.Analytics.Response.DetectLanguage> {
        const response = await this.er.jsonRequestAnalytics("/api/v1/detectLanguage", { text });
        return response?.data as ER.Analytics.Response.DetectLanguage;
    }
    /**
     * Extract all available information about an article available at url `url`.
     * Returned information will include article title, body, authors, links in the articles,...
     * @param url article url that'll be used for extraction
     * @param proxyUrl proxy that should be used for downloading article information. format: {schema}://{username}:{pass}@{proxy url/ip}
     */
    public async extractArticleInfo(url: string, proxyUrl?: string, headers?: {[name: string]: unknown}, cookies?: {[name: string]: unknown}): Promise<ER.Analytics.Response.ExtractArticleInfo> {
        const params: Record<string, string> = { url };
        if (!!proxyUrl) {
            params.proxyUrl = proxyUrl;
        }
        const response = await this.er.jsonRequestAnalytics("/api/v1/extractArticleInfo", params, headers, cookies);
        return response?.data as ER.Analytics.Response.ExtractArticleInfo;
    }

    /**
     * Extract named entities from the provided text. Supported languages are English, German, Spanish and Chinese.
     * @param text: text on which to extract named entities
     */
    public async ner(text: string) {
        const response = await this.er.jsonRequestAnalytics("/api/v1/ner", { text });
        return response?.data;
    }

    /**
     * Create a new topic and train it using the tweets that match the twitterQuery
     * @param twitterQuery string containing the content to search for. It can be a Twitter user account (using "@" prefix or user's Twitter url),a hash tag (using "#" prefix) or a regular keyword.
     * @param args Object which contains a host of optional parameters
     */
    public async trainTopicOnTweets(twitterQuery: string, args: ER.Analytics.TrainTopicOnTweetsArguments = {}): Promise<ER.Analytics.Response> {
        const {
            useTweetText = true,
            useIdfNormalization = true,
            normalization = "linear",
            maxTweets = 2000,
            maxUsedLinks = 500,
            ignoreConceptTypes = [],
            maxConcepts = 20,
            maxCategories = 10,
            notifyEmailAddress = undefined,
        } = args;
        if (maxTweets > 5000) {
            throw new Error("We can analyze at most 5000 tweets");
        }
        const params: Record<string, unknown> = {
            twitterQuery,
            useTweetText,
            useIdfNormalization,
            normalization,
            maxTweets,
            maxUsedLinks,
            maxConcepts,
            maxCategories,
        };
        if (notifyEmailAddress) {
            params.notifyEmailAddress = notifyEmailAddress;
        }
        if (ignoreConceptTypes && Object.keys(ignoreConceptTypes).length > 0) {
            params.ignoreConceptTypes = ignoreConceptTypes;
        }
        const response = await this.er.jsonRequestAnalytics("/api/v1/trainTopicOnTwitter", params);
        return response?.data as ER.Analytics.Response;
    }

    /**
     * Create a new topic to train. The user should remember the "uri" parameter returned in the result.
     * @param name name of the topic we want to create
     * @returns object containing the "uri" property that should be used in the follow-up call to trainTopic* methods
     */
    public async trainTopicCreateTopic(name: string): Promise<ER.Analytics.Response> {
        const response = await this.er.jsonRequestAnalytics("/api/v1/trainTopic", { action: "createTopic", name });
        return response?.data as ER.Analytics.Response;
    }

    /**
     * If the topic is already existing, clear the definition of the topic. Use this if you want to retrain an existing topic
     * @param uri uri of the topic (obtained by calling trainTopicCreateTopic method) to clear
     */
    public async trainTopicClearTopic(uri: string): Promise<ER.Analytics.Response> {
        const response = await this.er.jsonRequestAnalytics("/api/v1/trainTopic", { action: "clearTopic", uri });
        return response?.data as ER.Analytics.Response;
    }

    /**
     * Add the information extracted from the provided "text" to the topic with uri "uri".
     * @param uri uri of the topic (obtained by calling trainTopicCreateTopic method)
     * @param text text to analyze and extract information from
     */
    public async trainTopicAddDocument(uri: string, text: string): Promise<ER.Analytics.Response> {
        const response = await this.er.jsonRequestAnalytics("/api/v1/trainTopic", { action: "addDocument", uri, text });
        return response?.data as ER.Analytics.Response;
    }

    /**
     * Retrieve topic for the topic for which you have already finished training
     * @param uri uri of the topic (obtained by calling trainTopicCreateTopic method)
     * @returns returns the trained topic: { concepts: [], categories: [] }
     */
    public async trainTopicGetTrainedTopic(uri: string, args: ER.Analytics.TrainTopicGetTrainedTopicArguments = {}): Promise<ER.Analytics.Response> {
        const {
            maxConcepts = 20,
            maxCategories = 10,
            idfNormalization = true,
        } = args;
        const params = {
            action: "getTrainedTopic",
            uri: uri,
            maxConcepts: maxConcepts,
            maxCategories: maxCategories,
            idfNormalization: idfNormalization,
        };
        const response = await this.er.jsonRequestAnalytics("/api/v1/trainTopic", params);
        return response?.data as ER.Analytics.Response;
    }
}
