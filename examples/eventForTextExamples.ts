import { pathToFileURL } from "node:url";
import { EventRegistry, GetEventForText, QueryEvent, RequestEventInfo } from "eventregistry";

// Given some text that is related to some current event, this example demonstrates how to obtain
// information which event is the text talking about

const er = new EventRegistry();

async function main(): Promise<void> {
    const q1 = new GetEventForText(er);
    const response = await q1.compute(`
Croatian leaders put the army on alert after chaos erupted on the border with Serbia, where thousands
of asylum-seekers poured into the country. It is understood all traffic has been banned on roads
heading towards seven crossings into Serbia. Some were trampling each other in a rush to get on the few
available buses and trains, and dozens were injured in the mayhem.
`);
    console.info("Most similar info:");
    console.info(response);

    if (!Array.isArray(response) || response.length === 0) {
        return;
    }
    const eventUris = response.map((item: {eventUri: string}) => item.eventUri);
    const q2 = new QueryEvent(eventUris);
    q2.setRequestedResult(new RequestEventInfo());
    console.info("Event info:");
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
