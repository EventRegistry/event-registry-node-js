import { EventRegistry, GetRecentEvents, sleep } from "eventregistry";
import * as _ from "lodash";

// this is a simple script that makes a query to ER to get the feed of events that were added or
// updated in the last minute.
//
// For the received set of events, the script prints the basic event info and then goes and
// also downloads the top 20 articles assigned to this event in any of the languages

const er = new EventRegistry();
const recentQ = new GetRecentEvents(er);

// Simple use case of the ES& async/await
async function fetchUpdates() {
    // get the list of event URIs, sorted from the most recently changed backwards
    const {eventInfo = {}, activity} = await recentQ.getUpdates();
    if (eventInfo) {
        console.info(`==========`);
        console.info(`${_.size(eventInfo)} events updated since last call`);
        // for each updated event print the URI and the title
        // NOTE: the same event can appear multiple times in the activity array - this means that more than one article
        // about it was recently written about it
        _.each(activity, (eventUri) => {
            const event = eventInfo[eventUri];
            console.info(`Event ${eventUri} ('${event["title"][_.first(_.keys(event["title"]))]}')`);
            // event["concepts"] contains the list of relevant concepts for the event
            // event["categories"] contains the list of categories for the event

            // TODO: here you can do the processing that decides if the event is relevant for you or not. if relevant, send the info to an external service
        });
    }
    // wait exactly a minute until next batch of new content is ready
    await sleep(60 * 1000);
    fetchUpdates();
}
