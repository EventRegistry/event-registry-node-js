import { QueryParamsBase } from "./base";
import { EventRegistry } from "./eventRegistry";
import { ReturnInfo } from "./returnInfo";
export declare class GetRecentEvents extends QueryParamsBase {
    private er;
    constructor(er: EventRegistry, {mandatoryLang, mandatoryLocation, returnInfo}?: {
        mandatoryLang?: any;
        mandatoryLocation?: boolean;
        returnInfo?: ReturnInfo;
    });
    readonly path: string;
    getUpdates(): Promise<any>;
}
export declare class GetRecentArticles extends QueryParamsBase {
    private er;
    constructor(er: EventRegistry, {mandatorySourceLocation, articleLang, returnInfo}?: {
        mandatorySourceLocation?: any;
        articleLang?: boolean;
        returnInfo?: ReturnInfo;
    });
    readonly path: string;
    getUpdates(): Promise<any>;
}
