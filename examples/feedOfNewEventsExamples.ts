import { EventRegistry, GetRecentEvents, QueryEvents, RequestEventsRecentActivity, sleep } from "eventregistry";

// this is a simple script that makes a query to ER to get the feed of events that were added or
// updated in the last minute.
//
// For the received set of events, the script prints the basic event info and then goes and
// also downloads the top 20 articles assigned to this event in any of the languages

const er = new EventRegistry();
const recentQ = new GetRecentEvents(er);

// Simple use case of the ES6 async/await
async function fetchUpdates() {
    // get the list of event URIs, sorted from the most recently changed backwards
    const {eventInfo = {}, activity} = await recentQ.getUpdates();
    if (eventInfo) {
        console.info(`==========`);
        console.info(`${Object.values(eventInfo).length} events updated since last call`);
        // for each updated event print the URI and the title
        // NOTE: the same event can appear multiple times in the activity array - this means that more than one article
        // about it was recently written about it
        for (const eventUri of activity) {
            const event = eventInfo[eventUri];
            console.info(`Event ${eventUri} ('${event["title"][Object.keys(event["title"])[0]]}')`);
            // event["concepts"] contains the list of relevant concepts for the event
            // event["categories"] contains the list of categories for the event

            // TODO: here you can do the processing that decides if the event is relevant for you or not. if relevant, send the info to an external service
        }
    }
    // wait exactly a minute until next batch of new content is ready
    await sleep(60 * 1000);
    fetchUpdates();
}

/**
 * Alternatively you can also ask for a feed of added/updated events, but instead of all of them, just
 * obtain a subset of events that match certain conditions. The full stream of events can be filtered to
 * a subset that matches certain keyword, concept, location, source or other available filters in QueryEvents
 */
async function fetchFilteredUpdates() {
    const query = new QueryEvents({keywords: "Apple", minArticlesInEvent: 30, sourceLocationUri: await er.getLocationUri("United States")});
    query.setRequestedResult(
        new RequestEventsRecentActivity({
            // download at most 2000 events. if less of matching events were added/updated in last 10 minutes, less will be returned
            maxEventCount: 2000,
            // consider articles that were published at most 10 minutes ago
            updatesAfterMinsAgo: 10,
        })
    );
    const response = await er.execQuery(query);
    const activity = response?.recentActivityEvents?.activity ?? [];
    const eventInfo = response?.recentActivityEvents?.eventInfo ?? [];
    if (eventInfo) {
        console.info(`==========`);
        console.info(`${Object.values(eventInfo).length} events updated since last call`);
        // for each updated event print the URI and the title
        // NOTE: the same event can appear multiple times in the activity array - this means that more than one article
        // about it was recently written about it
        for (const eventUri of activity) {
            const event = eventInfo[eventUri];
            console.info(`Event ${eventUri} ('${event["title"][Object.keys(event["title"])[0]]}')`);
            // TODO: here you can do the processing that decides if the event is relevant for you or not. if relevant, send the info to an external service
        }
    }
    // wait exactly a minute until next batch of new content is ready
    await sleep(60 * 1000);
    fetchFilteredUpdates();
}