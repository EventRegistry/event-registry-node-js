import { QueryParamsBase } from "./base";
import { EventRegistry } from "./eventRegistry";
import { ReturnInfo } from "./returnInfo";

export class GetRecentEvents extends QueryParamsBase {
    private er: EventRegistry;
    constructor(er: EventRegistry, { mandatoryLang = undefined,
                                     mandatoryLocation = true,
                                     returnInfo = new ReturnInfo()
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
        const payload = response.recentActivityEvents as Record<string, unknown> | undefined;
        if (!payload) {
            return [];
        }
        const newestUri = payload.newestUri;
        if (newestUri && typeof newestUri === "object") {
            for (const [key, value] of Object.entries(newestUri as Record<string, string>)) {
                const splitKey = key.split("");
                this.setVal("recentActivityEvents" + splitKey[0].toUpperCase() + splitKey.slice(1).join(""), value);
            }
        }
        return Array.isArray(payload.activity) ? payload.activity : [];
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
