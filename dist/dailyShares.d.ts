import { QueryParamsBase } from "./base";
import { ER } from "./types";
export declare abstract class DailySharesBase extends QueryParamsBase {
    readonly path: string;
}
export declare class GetTopSharedArticles extends DailySharesBase {
    constructor(args?: ER.DailyShares.Arguments);
}
export declare class GetTopSharedEvents extends DailySharesBase {
    constructor(args?: ER.DailyShares.Arguments);
}
