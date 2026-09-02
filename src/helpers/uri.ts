import { EventRegistry } from "../eventRegistry";
import { ER } from "../types";

/**
 * Awaits a getXUri() lookup and throws a consistent "no match" error if it came back empty.
 * Backs every resolver below — they all follow the same resolve-or-throw shape.
 */
async function resolveOrThrow(resolve: () => Promise<string | undefined>, kind: string, label: string): Promise<string> {
    const uri = await resolve();
    if (!uri) {
        throw new Error(`No ${kind} uri found for label "${label}"`);
    }
    return uri;
}

/**
 * Resolve a concept label into its Event Registry concept uri.
 * Thin wrapper around `EventRegistry.getConceptUri()`. Throws if no match is found.
 */
export async function conceptUri(er: EventRegistry, label: string, args: ER.GetConceptUriArguments = {}): Promise<string> {
    return resolveOrThrow(() => er.getConceptUri(label, args), "concept", label);
}

/**
 * Resolve a dmoz category label into its Event Registry category uri.
 * Thin wrapper around `EventRegistry.getCategoryUri()`. Throws if no match is found.
 */
export async function categoryUri(er: EventRegistry, label: string): Promise<string> {
    return resolveOrThrow(() => er.getCategoryUri(label), "category", label);
}

/**
 * Resolve a news source name into its Event Registry source uri.
 * Thin wrapper around `EventRegistry.getNewsSourceUri()`. Throws if no match is found.
 */
export async function sourceUri(er: EventRegistry, label: string, dataType: ER.DataType[] | ER.DataType = ["news", "pr", "blog"]): Promise<string> {
    return resolveOrThrow(() => er.getNewsSourceUri(label, dataType), "source", label);
}

/**
 * Resolve a source group name into its Event Registry source group uri.
 * Thin wrapper around `EventRegistry.getSourceGroupUri()`. Throws if no match is found.
 */
export async function sourceGroupUri(er: EventRegistry, label: string): Promise<string> {
    return resolveOrThrow(() => er.getSourceGroupUri(label), "source group", label);
}

/**
 * Resolve a location label into its Event Registry location uri.
 * Thin wrapper around `EventRegistry.getLocationUri()`. Throws if no match is found.
 */
export async function locationUri(er: EventRegistry, label: string, args: ER.GetLocationUriArguments = {}): Promise<string> {
    return resolveOrThrow(() => er.getLocationUri(label, args), "location", label);
}

/**
 * Resolve an event type label into its Event Registry event type uri.
 * Thin wrapper around `EventRegistry.getEventTypeUri()`. Throws if no match is found.
 */
export async function eventTypeUri(er: EventRegistry, label: string): Promise<string> {
    return resolveOrThrow(() => er.getEventTypeUri(label), "event type", label);
}

/**
 * Resolve a concept class label into its Event Registry concept class uri.
 * Thin wrapper around `EventRegistry.getConceptClassUri()`. Throws if no match is found.
 */
export async function conceptClassUri(er: EventRegistry, label: string, lang = "eng"): Promise<string> {
    return resolveOrThrow(() => er.getConceptClassUri(label, lang), "concept class", label);
}

/**
 * Resolve an author name into its Event Registry author uri.
 * Thin wrapper around `EventRegistry.getAuthorUri()`. Throws if no match is found.
 */
export async function authorUri(er: EventRegistry, label: string): Promise<string> {
    return resolveOrThrow(() => er.getAuthorUri(label), "author", label);
}
