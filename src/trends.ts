import * as _ from "lodash";
import { QueryParamsBase } from "./base";
import { ReturnInfo } from "./returnInfo";

export abstract class TrendsBase extends QueryParamsBase {
    public get path() {
        return "/json/trends";
    }
}

export class GetTrendingConcepts extends TrendsBase {
    constructor({source = "news", count = 20, conceptType = ["person", "org", "loc"], returnInfo = new ReturnInfo()} = {}) {
        super();
        this.setVal("action", "getTrendingConcepts");
        this.setVal("source", source);
        if (source !== "social") {
            this.setVal("dataType", source);
        }
        this.setVal("conceptCount", count);
        this.setVal("conceptType", conceptType);
        this.params = _.extend({}, this.params, returnInfo.getParams());
    }
}

export class GetTrendingCategories extends TrendsBase {
    constructor({source = "news", count = 20, returnInfo = new ReturnInfo()} = {}) {
        super();
        this.setVal("action", "getTrendingCategories");
        this.setVal("source", source);
        if (source !== "social") {
            this.setVal("dataType", source);
        }
        this.setVal("categoryCount", count);
        this.params = _.extend({}, this.params, returnInfo.getParams());
    }
}

export class GetTrendingCustomItems extends TrendsBase {
    constructor({count = 20, returnInfo = new ReturnInfo()} = {}) {
        super();
        this.setVal("action", "getTrendingCustom");
        this.setVal("conceptCount", count);
        this.params = _.extend({}, this.params, returnInfo.getParams());
    }
}

export class GetTrendingConceptGroups extends TrendsBase {
    constructor({source = "news", count = 20, returnInfo = new ReturnInfo()} = {}) {
        super();
        this.setVal("action", "getConceptTrendGroups");
        this.setVal("source", source);
        this.setVal("conceptCount", count);
        this.params = _.extend({}, this.params, returnInfo.getParams());
    }

    public getConceptTypeGroups(types = ["person", "org", "loc"]) {
        this.setVal("conceptType", types);
    }

    public getConceptClassUris(conceptClassUris) {
        this.setVal("conceptClassUri", conceptClassUris);
    }
}
