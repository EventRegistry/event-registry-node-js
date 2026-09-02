import { EventRegistry } from "../eventRegistry";
import { RequestStory } from "../queryStory";
import { ER } from "../types";
import { getStory } from "../helpers/stories";

export class StoriesFluent {
    constructor(private readonly er: EventRegistry) {}

    get(storyUriOrList: string | string[], requestStory?: RequestStory): Promise<ER.Response> {
        return getStory(this.er, storyUriOrList, requestStory);
    }
}
