import { EventRegistry } from "../eventRegistry";
import {
    GetTrendingCategories,
    GetTrendingConceptGroups,
    GetTrendingConcepts,
    GetTrendingCustomItems
} from "../trends";
import { ER } from "../types";
import {
    getTrendingCategories,
    getTrendingConceptGroups,
    getTrendingConcepts,
    getTrendingCustomItems
} from "../helpers/trends";

export class TrendsFluent {
    constructor(private readonly er: EventRegistry) {}

    concepts(args: ConstructorParameters<typeof GetTrendingConcepts>[0] = {}): Promise<ER.Response> {
        return getTrendingConcepts(this.er, args);
    }

    categories(args: ConstructorParameters<typeof GetTrendingCategories>[0] = {}): Promise<ER.Response> {
        return getTrendingCategories(this.er, args);
    }

    customItems(args: ConstructorParameters<typeof GetTrendingCustomItems>[0] = {}): Promise<ER.Response> {
        return getTrendingCustomItems(this.er, args);
    }

    conceptGroups(args: ConstructorParameters<typeof GetTrendingConceptGroups>[0] = {}): Promise<ER.Response> {
        return getTrendingConceptGroups(this.er, args);
    }
}
