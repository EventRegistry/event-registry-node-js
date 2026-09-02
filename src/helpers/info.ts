import { EventRegistry } from "../eventRegistry";
import { GetCategoryInfo, GetConceptInfo, GetSourceInfo, GetSourceStats } from "../info";
import { ER } from "../types";

export async function getSourceInfo(
    er: EventRegistry,
    args: ER.Info.GetSourceInfoArguments = {}
): Promise<ER.Response> {
    return er.execQuery(new GetSourceInfo(args));
}

export async function getConceptInfo(
    er: EventRegistry,
    args: ER.Info.GetConceptInfoArguments = {}
): Promise<ER.Response> {
    return er.execQuery(new GetConceptInfo(args));
}

export async function getCategoryInfo(
    er: EventRegistry,
    args: ER.Info.GetCategoryInfoArguments = {}
): Promise<ER.Response> {
    return er.execQuery(new GetCategoryInfo(args));
}

export async function getSourceStats(
    er: EventRegistry,
    sourceUri?: string
): Promise<ER.Response> {
    return er.execQuery(new GetSourceStats(sourceUri));
}
