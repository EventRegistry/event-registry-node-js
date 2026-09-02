import { EventRegistry } from "../eventRegistry";
import { GetEventForText } from "../eventForText";

/**
 * Find the event(s) that best match the given input text.
 * Thin wrapper around `GetEventForText.compute()`.
 */
export async function getEventForText(
    er: EventRegistry,
    text: string,
    lang: string = "eng",
    nrOfEventsToReturn: number = 5
): Promise<unknown> {
    const q = new GetEventForText(er, nrOfEventsToReturn);
    return q.compute(text, lang);
}
