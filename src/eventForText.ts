import * as _ from "lodash";
import { QueryParamsBase, sleep } from "./base";
import { EventRegistry } from "./eventRegistry";
/**
 * The GetEventForText class can be used to find the event(s) that best matches the given input text.
 * The request is performed asynchronously.
 *
 * Note: The functionality can only be used to find the events in the last 5 days. Older events cannot
 * be matched in this way
 *
 * Return info from the compute() method is in the form:
 *
 * [
 *     {
 *         "cosSim": 0.07660648086468567,
 *         "eventUri": "4969",
 *         "storyUri": "eng-af6ce79f-cb91-4010-8ddf-7ad924bc5638-40591"
 *     },
 *     {
 *         "cosSim": 0.05851939237670918,
 *         "eventUri": "5157",
 *         "storyUri": "eng-af6ce79f-cb91-4010-8ddf-7ad924bc5638-56286"
 *     },
 *     ...
 * ]
 *
 * Where
 * - cosSim represents the cosine similarity of the document to the cluster
 * - eventUri is the uri of the corresponding event in the Event Registry
 * - storyUri is the uri of the story in the Event Registry
 *
 * You can use QueryEvent or QueryStory to obtain more information about these events/stories
 *
 */
export class GetEventForText extends QueryParamsBase {
    private er: EventRegistry;
    private nrOfEventsToReturn: number;
    /**
     * @param er instance of EventRegistry class
     * @param nrOfEventsToReturn number of events to return for the given text
     */
    constructor(er: EventRegistry, nrOfEventsToReturn: number = 5) {
        super();
        this.er = er;
        this.nrOfEventsToReturn = nrOfEventsToReturn;
    }

    /**
     * Compute the list of most similar events for the given text
     * @param text text for which to find the most similar event
     * @param lang language in which the text is written
     */
    public async compute(text: string, lang: string = "eng") {
        const params = {lang: lang, text: text, topClustersCount: this.nrOfEventsToReturn};
        const response = await this.er.jsonRequest("/json/getEventForText/enqueueRequest", params);
        const requestId = _.get(response, "requestId");
        for (const i of _.range(10)) {
            await sleep(1000);
            const res = await this.er.jsonRequest("/json/getEventForText/testRequest", { requestId });
            if (_.isArray(res) && !_.isEmpty(res)) {
                return res as any;
            }
        }
    }
}
