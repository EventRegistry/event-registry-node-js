import { EventRegistry } from "../eventRegistry";
import { ER } from "../types";
import { getCategoryInfo, getConceptInfo, getSourceInfo, getSourceStats } from "../helpers/info";

export class InfoFluent {
    constructor(private readonly er: EventRegistry) {}

    source(args: ER.Info.GetSourceInfoArguments = {}): Promise<ER.Response> {
        return getSourceInfo(this.er, args);
    }

    concept(args: ER.Info.GetConceptInfoArguments = {}): Promise<ER.Response> {
        return getConceptInfo(this.er, args);
    }

    category(args: ER.Info.GetCategoryInfoArguments = {}): Promise<ER.Response> {
        return getCategoryInfo(this.er, args);
    }

    sourceStats(sourceUri?: string): Promise<ER.Response> {
        return getSourceStats(this.er, sourceUri);
    }
}
