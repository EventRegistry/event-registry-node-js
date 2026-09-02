import { EventRegistry } from "./eventRegistry";

/**
 * @class TopicPages
 * Helper for listing topic pages owned by the authenticated user.
 */
export class TopicPages {
    constructor(private eventRegistry: EventRegistry) { }

    /**
     * Return the list of topic pages owned by the current user.
     */
    public async getMyTopicPages(): Promise<unknown[]> {
        const response = await this.eventRegistry.jsonRequest("/api/v1/user/getUserProfile", {});
        const profile = response?.data as { ownedTopicPages?: unknown[] } | undefined;
        return profile?.ownedTopicPages ?? [];
    }
}
