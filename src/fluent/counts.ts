import { EventRegistry } from "../eventRegistry";
import { ER } from "../types";
import { getCounts, getCountsEx } from "../helpers/counts";

export class CountsFluent {
    constructor(private readonly er: EventRegistry) {}

    get(uriOrUriList: string | string[], args: ER.Counts.Arguments = {}): Promise<ER.Response> {
        return getCounts(this.er, uriOrUriList, args);
    }

    ex(uriOrUriList: string | string[], args: ER.Counts.Arguments = {}): Promise<ER.Response> {
        return getCountsEx(this.er, uriOrUriList, args);
    }
}
