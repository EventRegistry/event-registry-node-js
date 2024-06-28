import { QueryParamsBase } from "./base";
import { EventRegistry } from "./eventRegistry";
import { ReturnInfo } from "./returnInfo";
import { ER } from "./types";

export class GetRecentEvents extends QueryParamsBase {
    private er: EventRegistry;
    constructor(er: EventRegistry, { mandatoryLang = undefined,
                                     mandatoryLocation = true,
                                     returnInfo = new ReturnInfo(),
                                   } = {}) {
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
        return (response.recentActivityEvents as Record<string, ER.Results>)?.activity || {};
    }
}

export class GetRecentArticles extends QueryParamsBase {
    private er: EventRegistry;
    constructor(er: EventRegistry, { mandatorySourceLocation = undefined,
                                     lang = undefined,
                                     returnInfo = new ReturnInfo(),
                                     ...kwargs
                                   } = {}) {
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
            for (const [key, value] of Object.entries((response.recentActivityArticles as unknown as Record<string, string>).newestUri || {})) {
                const splitKey = key.split("");
                this.setVal("recentActivityArticles" + splitKey[0].toUpperCase() + splitKey.slice(1).join(""), value);
            }
            return (response.recentActivityArticles as unknown as Record<string, unknown[]>).activity || [];
        }
        return [];
    }
}
