import { EventRegistry } from "../eventRegistry";
import { ER } from "../types";
import {
    analyzeSentiment,
    annotateText,
    categorizeText,
    detectLanguage,
    extractArticleInfo,
    ner,
    semanticSimilarity,
    trainTopicAddDocument,
    trainTopicClearTopic,
    trainTopicCreateTopic,
    trainTopicGetTrainedTopic,
    trainTopicOnTweets
} from "../helpers/analytics";

export class AnalyticsFluent {
    constructor(private readonly er: EventRegistry) {}

    annotate(text: string, lang?: string[], customParams?: { [name: string]: unknown }): Promise<ER.Analytics.Response.Annotate> {
        return annotateText(this.er, text, lang, customParams);
    }

    categorize(text: string, taxonomy: "dmoz" | "news" = "dmoz", concepts?: string[]): Promise<ER.Analytics.Response.Categorize> {
        return categorizeText(this.er, text, taxonomy, concepts);
    }

    sentiment(
        text: string,
        method = "vocabulary",
        sentences = 10,
        returnSentences = true
    ): Promise<ER.Analytics.Response.Sentiment> {
        return analyzeSentiment(this.er, text, method, sentences, returnSentences);
    }

    semanticSimilarity(text1: string, text2: string, distanceMeasure: "cosine" | "jaccard" = "cosine"): Promise<ER.Analytics.Response.SentimentSimilarity> {
        return semanticSimilarity(this.er, text1, text2, distanceMeasure);
    }

    detectLanguage(text: string): Promise<ER.Analytics.Response.DetectLanguage> {
        return detectLanguage(this.er, text);
    }

    extractArticleInfo(
        url: string,
        proxyUrl?: string,
        headers?: { [name: string]: unknown },
        cookies?: { [name: string]: unknown }
    ): Promise<ER.Analytics.Response.ExtractArticleInfo> {
        return extractArticleInfo(this.er, url, proxyUrl, headers, cookies);
    }

    ner(text: string) {
        return ner(this.er, text);
    }

    trainTopicOnTweets(
        twitterQuery: string,
        args: ER.Analytics.TrainTopicOnTweetsArguments = {}
    ): Promise<ER.Analytics.Response> {
        return trainTopicOnTweets(this.er, twitterQuery, args);
    }

    trainTopicCreateTopic(name: string): Promise<ER.Analytics.Response> {
        return trainTopicCreateTopic(this.er, name);
    }

    trainTopicClearTopic(uri: string): Promise<ER.Analytics.Response> {
        return trainTopicClearTopic(this.er, uri);
    }

    trainTopicAddDocument(uri: string, text: string): Promise<ER.Analytics.Response> {
        return trainTopicAddDocument(this.er, uri, text);
    }

    trainTopicGetTrainedTopic(
        uri: string,
        args: ER.Analytics.TrainTopicGetTrainedTopicArguments = {}
    ): Promise<ER.Analytics.Response> {
        return trainTopicGetTrainedTopic(this.er, uri, args);
    }
}
