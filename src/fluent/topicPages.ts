import { EventRegistry } from "../eventRegistry";
import { TopicPage } from "../topicPage";
import { ER } from "../types";
import { createTopicPage, getMyTopicPages, loadTopicPage } from "../helpers/topicPages";

export class TopicPagesFluent {
    constructor(private readonly er: EventRegistry) {}

    mine(): Promise<unknown[]> {
        return getMyTopicPages(this.er);
    }

    load(uri: string): Promise<ER.TopicPage> {
        return loadTopicPage(this.er, uri);
    }

    create(): TopicPage {
        return createTopicPage(this.er);
    }
}
