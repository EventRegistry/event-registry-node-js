import * as _ from "lodash";
import { QueryParamsBase } from "./base";
import { EventRegistry } from "./eventRegistry";
import { ReturnInfo } from "./returnInfo";

export class GetRecentEvents extends QueryParamsBase {
    private er: EventRegistry;
    constructor(er: EventRegistry, { mandatoryLang = undefined,
                                     mandatoryLocation = true,
                                     returnInfo = new ReturnInfo(),
                                   } = {}) {
        super();
        this.er = er;
        this.setVal("recentActivityEventsMandatoryLocation", mandatoryLocation);
        if (!_.isUndefined(mandatoryLang)) {
            this.setVal("recentActivityEventsMandatoryLang", mandatoryLang);
        }
        this.params = _.extend({}, this.params, returnInfo.getParams("recentActivityEvents"));
    }

    public get path() {
        return "/json/minuteStreamEvents";
    }

    public async getUpdates() {
        const response = await this.er.execQuery(this);
        return _.get(response, "recentActivity.events", {});
    }
}

export class GetRecentArticles extends QueryParamsBase {
    private er: EventRegistry;
    constructor(er: EventRegistry, { mandatorySourceLocation = undefined,
                                     articleLang = true,
                                     returnInfo = new ReturnInfo(),
                                   } = {}) {
        super();
        this.er = er;
        this.setVal("recentActivityArticlesMandatorySourceLocation", mandatorySourceLocation);
        if (!_.isUndefined(articleLang)) {
            this.setVal("recentActivityArticlesLang", articleLang);
        }
        this.params = _.extend({}, this.params, returnInfo.getParams("recentActivityArticles"));
    }

    public get path() {
        return "/json/minuteStreamArticles";
    }

    public async getUpdates() {
        const response = await this.er.execQuery(this);
        return _.get(response, "recentActivity.articles.activity", []);
    }
}
