import { EventRegistry } from "../eventRegistry";
import { Analytics } from "../analytics";
import { ER } from "../types";

/**
 * Identify the list of entities and non-entities mentioned in the text.
 * Thin wrapper around `Analytics.annotate()`.
 */
export async function annotateText(
    er: EventRegistry,
    text: string,
    lang?: string[],
    customParams?: { [name: string]: unknown }
): Promise<ER.Analytics.Response.Annotate> {
    return new Analytics(er).annotate(text, lang, customParams);
}

/**
 * Determine up to 5 categories the text is about.
 * Thin wrapper around `Analytics.categorize()`.
 */
export async function categorizeText(
    er: EventRegistry,
    text: string,
    taxonomy: "dmoz" | "news" = "dmoz",
    concepts?: string[]
): Promise<ER.Analytics.Response.Categorize> {
    return new Analytics(er).categorize(text, taxonomy, concepts);
}

/**
 * Determine the sentiment of the provided text.
 * Thin wrapper around `Analytics.sentiment()`.
 */
export async function analyzeSentiment(
    er: EventRegistry,
    text: string,
    method = "vocabulary",
    sentences = 10,
    returnSentences = true
): Promise<ER.Analytics.Response.Sentiment> {
    return new Analytics(er).sentiment(text, method, sentences, returnSentences);
}

/**
 * Compute the semantic similarity between two texts.
 * Thin wrapper around `Analytics.semanticSimilarity()`.
 */
export async function semanticSimilarity(
    er: EventRegistry,
    text1: string,
    text2: string,
    distanceMeasure: "cosine" | "jaccard" = "cosine"
): Promise<ER.Analytics.Response.SentimentSimilarity> {
    return new Analytics(er).semanticSimilarity(text1, text2, distanceMeasure);
}

/**
 * Determine the language of the given text.
 * Thin wrapper around `Analytics.detectLanguage()`.
 */
export async function detectLanguage(er: EventRegistry, text: string): Promise<ER.Analytics.Response.DetectLanguage> {
    return new Analytics(er).detectLanguage(text);
}

/**
 * Extract available information about an article at the given url.
 * Thin wrapper around `Analytics.extractArticleInfo()`.
 */
export async function extractArticleInfo(
    er: EventRegistry,
    url: string,
    proxyUrl?: string,
    headers?: { [name: string]: unknown },
    cookies?: { [name: string]: unknown }
): Promise<ER.Analytics.Response.ExtractArticleInfo> {
    return new Analytics(er).extractArticleInfo(url, proxyUrl, headers, cookies);
}

/**
 * Extract named entities from the provided text.
 * Thin wrapper around `Analytics.ner()`.
 */
export async function ner(er: EventRegistry, text: string) {
    return new Analytics(er).ner(text);
}

/**
 * Create and train a topic from tweets matching the given query.
 * Thin wrapper around `Analytics.trainTopicOnTweets()`.
 */
export async function trainTopicOnTweets(
    er: EventRegistry,
    twitterQuery: string,
    args: ER.Analytics.TrainTopicOnTweetsArguments = {}
): Promise<ER.Analytics.Response> {
    return new Analytics(er).trainTopicOnTweets(twitterQuery, args);
}

/**
 * Create an empty topic for training.
 * Thin wrapper around `Analytics.trainTopicCreateTopic()`.
 */
export async function trainTopicCreateTopic(er: EventRegistry, name: string): Promise<ER.Analytics.Response> {
    return new Analytics(er).trainTopicCreateTopic(name);
}

/**
 * Clear a previously created topic.
 * Thin wrapper around `Analytics.trainTopicClearTopic()`.
 */
export async function trainTopicClearTopic(er: EventRegistry, uri: string): Promise<ER.Analytics.Response> {
    return new Analytics(er).trainTopicClearTopic(uri);
}

/**
 * Add a document to a topic being trained.
 * Thin wrapper around `Analytics.trainTopicAddDocument()`.
 */
export async function trainTopicAddDocument(er: EventRegistry, uri: string, text: string): Promise<ER.Analytics.Response> {
    return new Analytics(er).trainTopicAddDocument(uri, text);
}

/**
 * Retrieve a completed trained topic.
 * Thin wrapper around `Analytics.trainTopicGetTrainedTopic()`.
 */
export async function trainTopicGetTrainedTopic(
    er: EventRegistry,
    uri: string,
    args: ER.Analytics.TrainTopicGetTrainedTopicArguments = {}
): Promise<ER.Analytics.Response> {
    return new Analytics(er).trainTopicGetTrainedTopic(uri, args);
}
