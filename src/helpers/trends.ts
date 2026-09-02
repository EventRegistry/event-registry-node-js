import { EventRegistry } from "../eventRegistry";
import {
    GetTrendingCategories,
    GetTrendingConceptGroups,
    GetTrendingConcepts,
    GetTrendingCustomItems
} from "../trends";
import { ER } from "../types";

export async function getTrendingConcepts(
    er: EventRegistry,
    args: ConstructorParameters<typeof GetTrendingConcepts>[0] = {}
): Promise<ER.Response> {
    return er.execQuery(new GetTrendingConcepts(args));
}

export async function getTrendingCategories(
    er: EventRegistry,
    args: ConstructorParameters<typeof GetTrendingCategories>[0] = {}
): Promise<ER.Response> {
    return er.execQuery(new GetTrendingCategories(args));
}

export async function getTrendingCustomItems(
    er: EventRegistry,
    args: ConstructorParameters<typeof GetTrendingCustomItems>[0] = {}
): Promise<ER.Response> {
    return er.execQuery(new GetTrendingCustomItems(args));
}

export async function getTrendingConceptGroups(
    er: EventRegistry,
    args: ConstructorParameters<typeof GetTrendingConceptGroups>[0] = {}
): Promise<ER.Response> {
    return er.execQuery(new GetTrendingConceptGroups(args));
}
