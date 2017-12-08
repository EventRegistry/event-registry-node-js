import { EventRegistry, GetEventForText, QueryEvent, RequestEventInfo } from "eventregistry";
import * as _ from "lodash";

// Given some text that is related to some current event, this example demonstrates how to obtain
// information which event is the text talking about

const er = new EventRegistry();

const q1 = new GetEventForText(er);

q1.compute(`
Croatian leaders put the army on alert after chaos erupted on the border with Serbia, where thousands
of asylum-seekers poured into the country. It is understood all traffic has been banned on roads
heading towards seven crossings into Serbia. Some were trampling each other in a rush to get on the few
available buses and trains, and dozens were injured in the mayhem.
`).then((response) => {
    console.info(`Most similar info:`);
    console.info(response);

    if (_.isEmpty(response)) {
        return;
    }
    // get the events ids that are most related to the given text
    const eventUris = _.map(response, "eventUri") as string[];
    // obtain information about those events
    const q2 = new QueryEvent(eventUris);
    q2.setRequestedResult(new RequestEventInfo());
    return er.execQuery(q2);
}).then((response) => {
    console.info(`Event info:`);
    console.info(response);
});
