import { QueryParamsBase } from "./base";
import { ReturnInfo } from "./returnInfo";
export declare abstract class TrendsBase extends QueryParamsBase {
    readonly path: string;
}
export declare class GetTrendingConcepts extends TrendsBase {
    constructor({source, count, conceptType, returnInfo}?: {
        source?: string;
        count?: number;
        conceptType?: string[];
        returnInfo?: ReturnInfo;
    });
}
export declare class GetTrendingCategories extends TrendsBase {
    constructor({source, count, returnInfo}?: {
        source?: string;
        count?: number;
        returnInfo?: ReturnInfo;
    });
}
export declare class GetTrendingCustomItems extends TrendsBase {
    constructor({count, returnInfo}?: {
        count?: number;
        returnInfo?: ReturnInfo;
    });
}
export declare class GetTrendingConceptGroups extends TrendsBase {
    constructor({source, count, returnInfo}?: {
        source?: string;
        count?: number;
        returnInfo?: ReturnInfo;
    });
    getConceptTypeGroups(types?: string[]): void;
    getConceptClassUris(conceptClassUris: any): void;
}
