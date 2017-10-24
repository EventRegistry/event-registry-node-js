import * as _ from "lodash";
import * as moment from "moment";
import { QueryParamsBase } from "./base";
import { ReturnInfo } from "./returnInfo";
import { ER } from "./types";

// Using the bottom classes you can obtain information about articles and events that
// were shared the most on social media (Twitter and Facebook) on a particular day.
// Given a date, articles published on that date are checked and top shared ones are returned.
// For an event, events on that day are checked and top shared ones are returned.
// Social score for an article is computed as the sum of shares on facebook and twitter.
// Social score for an event is computed by checking 30 top shared articles in the event and averaging their social scores.

export abstract class DailySharesBase extends QueryParamsBase {
    public get path() {
        return "/json/topDailyShares";
    }
}

export class GetTopSharedArticles extends DailySharesBase {
    constructor(args: ER.DailyShares.Arguments = {}) {
        const {date = moment().format("YYYY-MM-DD"), count = 20, returnInfo = new ReturnInfo()} = args;
        super();
        this.setVal("action", "getArticles");
        this.setVal("count", count);
        this.setDateVal("date", date);
        this.params = _.extend({}, this.params, returnInfo.getParams());
    }
}

export class GetTopSharedEvents extends DailySharesBase {
    constructor(args: ER.DailyShares.Arguments = {}) {
        const {date = moment().format("YYYY-MM-DD"), count = 20, returnInfo = new ReturnInfo()} = args;
        super();
        this.setVal("action", "getEvents");
        this.setVal("count", count);
        this.setDateVal("date", date);
        this.params = _.extend({}, this.params, returnInfo.getParams());
    }
}
