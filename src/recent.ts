import { QueryParamsBase } from "./base";
import { EventRegistry } from "./eventRegistry";
import { ReturnInfo } from "./returnInfo";

/** Position in the minute stream: the newest uri per stream key, as returned by the API (`newestUri`). */
export type RecentCursor = Record<string, string>;

export class GetRecentEvents extends QueryParamsBase {
    private er: EventRegistry;
    private cursor: RecentCursor = {};
    constructor(er: EventRegistry, { mandatoryLang = undefined,
                                     mandatoryLocation = true,
                                     returnInfo = new ReturnInfo()
                                   }: { mandatoryLang?: string | string[]; mandatoryLocation?: boolean; returnInfo?: ReturnInfo } = {}) {
        super();
        this.er = er;
        this.setVal("recentActivityEventsMandatoryLocation", mandatoryLocation);
        if (mandatoryLang !== undefined) {
            this.setVal("recentActivityEventsMandatoryLang", mandatoryLang);
        }
        this.params = {...this.params, ...returnInfo.getParams("recentActivityEvents")};
    }

    public get path() {
        return "/api/v1/minuteStreamEvents";
    }

    public async getUpdates() {
        const response = await this.er.execQuery(this);
        const payload = response.recentActivityEvents as Record<string, unknown> | undefined;
        if (!payload) {
            return [];
        }
        const newestUri = payload.newestUri;
        if (newestUri && typeof newestUri === "object") {
            this.setCursor(newestUri as RecentCursor);
        }
        return Array.isArray(payload.activity) ? payload.activity : [];
    }

    /** The position reached by the last `getUpdates()`; persist it to resume after a restart. */
    public getCursor(): RecentCursor {
        return { ...this.cursor };
    }

    /** Continue after a position returned earlier by `getCursor()`. */
    public setCursor(cursor: RecentCursor): void {
        this.cursor = { ...cursor };
        for (const [key, value] of Object.entries(cursor)) {
            this.setVal("recentActivityEvents" + key.charAt(0).toUpperCase() + key.slice(1), value);
        }
    }
}

export class GetRecentArticles extends QueryParamsBase {
    private er: EventRegistry;
    private cursor: RecentCursor = {};
    constructor(er: EventRegistry, { mandatorySourceLocation = undefined,
                                     lang = undefined,
                                     returnInfo = new ReturnInfo(),
                                     ...kwargs
                                   }: { mandatorySourceLocation?: boolean; lang?: string | string[]; returnInfo?: ReturnInfo } = {}) {
        super();
        this.er = er;
        this.setVal("recentActivityArticlesMandatorySourceLocation", mandatorySourceLocation);
        if (lang !== undefined) {
            this.setVal("recentActivityArticlesLang", lang);
        }
        this.params = {...this.params, ...kwargs};
        this.params = {...this.params, ...returnInfo.getParams("recentActivityArticles")};
    }

    public get path() {
        return "/api/v1/minuteStreamArticles";
    }

    public async getUpdates() {
        const response = await this.er.execQuery(this);
        if (response?.recentActivityArticles) {
            this.setCursor((response.recentActivityArticles as unknown as Record<string, RecentCursor>).newestUri || {});
            return (response.recentActivityArticles as unknown as Record<string, unknown[]>).activity || [];
        }
        return [];
    }

    /** The position reached by the last `getUpdates()`; persist it to resume after a restart. */
    public getCursor(): RecentCursor {
        return { ...this.cursor };
    }

    /** Continue after a position returned earlier by `getCursor()`. */
    public setCursor(cursor: RecentCursor): void {
        this.cursor = { ...cursor };
        for (const [key, value] of Object.entries(cursor)) {
            this.setVal("recentActivityArticles" + key.charAt(0).toUpperCase() + key.slice(1), value);
        }
    }
}
