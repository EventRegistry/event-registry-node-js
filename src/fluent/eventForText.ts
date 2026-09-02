import { EventRegistry } from "../eventRegistry";
import { getEventForText } from "../helpers/eventForText";

/** Ergonomic callable form of `GetEventForText.compute()` — see `helpers/eventForText.getEventForText`. */
export type EventForTextFluent = (text: string, lang?: string, nrOfEventsToReturn?: number) => Promise<unknown>;

export function createEventForTextFluent(er: EventRegistry): EventForTextFluent {
    return (text: string, lang: string = "eng", nrOfEventsToReturn: number = 5) =>
        getEventForText(er, text, lang, nrOfEventsToReturn);
}
