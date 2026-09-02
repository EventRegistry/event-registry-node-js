import { pathToFileURL } from "node:url";
import {
    EventRegistry,
    QueryMentions,
    RequestMentionsUriWgtList,
} from "eventregistry";

// examples of how to search for mentions using different search criteria

const er = new EventRegistry({allowUseOfArchive: false});

async function main(): Promise<void> {
    const q1 = new QueryMentions({eventTypeUri: "et/business/acquisitions-mergers"});
    q1.setRequestedResult(new RequestMentionsUriWgtList());
    console.info(await er.execQuery(q1));

    const q2 = new QueryMentions({eventTypeUri: "et/business/labor-issues"});
    console.info(await er.execQuery(q2));
}

const invokedDirectly = process.argv[1] !== undefined
    && import.meta.url === pathToFileURL(process.argv[1]).href;

if (invokedDirectly) {
    void main().catch((error: unknown) => {
        console.error(error);
        process.exitCode = 1;
    });
}
