import { EventRegistry } from "../eventRegistry";
import { TopicPage } from "../topicPage";
import { TopicPages } from "../topicPages";
import { ER } from "../types";

/**
 * Return the list of topic pages owned by the current user.
 * Thin wrapper around `TopicPages.getMyTopicPages()`.
 */
export async function getMyTopicPages(er: EventRegistry): Promise<unknown[]> {
    const pages = new TopicPages(er);
    return pages.getMyTopicPages();
}

/**
 * Load an existing topic page definition from Event Registry by uri.
 */
export async function loadTopicPage(er: EventRegistry, uri: string): Promise<ER.TopicPage> {
    const topicPage = new TopicPage(er);
    return topicPage.loadTopicPageFromER(uri);
}

/**
 * Create a new, empty `TopicPage` builder bound to this `EventRegistry` instance.
 */
export function createTopicPage(er: EventRegistry): TopicPage {
    return new TopicPage(er);
}
