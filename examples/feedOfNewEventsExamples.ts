import { pathToFileURL } from "node:url";
import { EventRegistry, GetRecentEvents, QueryEvents, RequestEventsRecentActivity } from "eventregistry";

// this is a simple script that makes a query to ER to get the feed of events that were added or
// updated in the last minute.

type RecentEvent = {title: Record<string, string>};
type RecentEventsResponse = {
    activity?: string[];
    eventInfo?: Record<string, RecentEvent>;
    recentActivityEvents?: {
        activity?: string[];
        eventInfo?: Record<string, RecentEvent>;
    };
};

const er = new EventRegistry();
const recentQ = new GetRecentEvents(er);

async function fetchUpdates() {
    // getUpdates() returns the activity list (event URIs), not {activity, eventInfo}.
    // Titles live on the full execQuery payload: response.recentActivityEvents.eventInfo
    // (see fetchFilteredUpdates below).
    const activity = await recentQ.getUpdates();
    const eventUris = Array.isArray(activity) ? activity : Object.values(activity);
    console.info(`==========`);
    console.info(`${eventUris.length} event URIs updated since last call`);
    for (const eventUri of eventUris) {
        console.info(`Event ${eventUri}`);
    }
    // To poll every minute, wrap this call in a loop with `await sleep(60 * 1000)`.
}

async function fetchFilteredUpdates() {
    const query = new QueryEvents({keywords: "Apple", minArticlesInEvent: 30, sourceLocationUri: await er.getLocationUri("United States")});
    query.setRequestedResult(
        new RequestEventsRecentActivity({
            maxEventCount: 2000,
            updatesAfterMinsAgo: 10,
        })
    );
    const response = await er.execQuery<RecentEventsResponse>(query);
    const activity = response?.recentActivityEvents?.activity ?? [];
    const eventInfo = response?.recentActivityEvents?.eventInfo ?? {};
    console.info(`==========`);
    console.info(`${Object.values(eventInfo).length} events updated since last call`);
    for (const eventUri of activity) {
        const event = eventInfo[eventUri];
        const title = event?.title ? event.title[Object.keys(event.title)[0]] : "";
        console.info(`Event ${eventUri} ('${title}')`);
    }
}

async function main(): Promise<void> {
    await fetchUpdates();
    await fetchFilteredUpdates();
}

const invokedDirectly = process.argv[1] !== undefined
    && import.meta.url === pathToFileURL(process.argv[1]).href;

if (invokedDirectly) {
    void main().catch((error: unknown) => {
        console.error(error);
        process.exitCode = 1;
    });
}
