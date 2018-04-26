import * as _ from "lodash";
import { ER } from "./types";

export abstract class ReturnInfoFlagsBase<T extends {}> {
    protected type: string;
    private data = {};

    public setFlag(key, obj, defaultValue) {
        if (_.has(obj, key)) {
            this.setProperty("Include" + this.type + _.upperFirst(key), obj[key], defaultValue);
        }
    }

    public setValue(key, obj, defaultValue?, skipKeyMod = false) {
        if (_.has(obj, key)) {
            const constructedKey = skipKeyMod ? _.upperFirst(key) : this.type + _.upperFirst(key);
            this.setProperty(constructedKey, obj[key], defaultValue);
        }
    }

    public getProperties(prefix = "") {
        return _.mapKeys(this.data, (value, key) => {
            if (_.startsWith(_.toLower(key), _.toLower(prefix))) {
                return _.camelCase(key);
            } else {
                return _.camelCase(prefix + key);
            }
        });
    }

    private setProperty(key, value, defaultValue?) {
        if (value !== defaultValue) {
            _.set(this.data, key, value);
        }
    }
}

export class ReturnInfo {
    private articleInfo: ArticleInfoFlags;
    private eventInfo: EventInfoFlags;
    private sourceInfo: SourceInfoFlags;
    private categoryInfo: CategoryInfoFlags;
    private conceptInfo: ConceptInfoFlags;
    private locationInfo: LocationInfoFlags;
    private storyInfo: StoryInfoFlags;
    private conceptClassInfo: ConceptClassInfoFlags;
    private conceptFolderInfo: ConceptFolderInfoFlags;
    // Accepts all InfoFlags
    constructor({
            articleInfo = new ArticleInfoFlags(),
            eventInfo = new EventInfoFlags(),
            sourceInfo = new SourceInfoFlags(),
            categoryInfo = new CategoryInfoFlags(),
            conceptInfo = new ConceptInfoFlags(),
            locationInfo = new LocationInfoFlags(),
            storyInfo = new StoryInfoFlags(),
            conceptClassInfo = new ConceptClassInfoFlags(),
            conceptFolderInfo = new ConceptFolderInfoFlags(),
        } = {}) {
        this.articleInfo = articleInfo;
        this.eventInfo = eventInfo;
        this.sourceInfo = sourceInfo;
        this.categoryInfo = categoryInfo;
        this.conceptInfo = conceptInfo;
        this.locationInfo = locationInfo;
        this.storyInfo = storyInfo;
        this.conceptClassInfo = conceptClassInfo;
        this.conceptFolderInfo = conceptFolderInfo;
    }

    public getParams(prefix?) {
        return _.extend(
            {},
            this.articleInfo.getProperties(prefix),
            this.eventInfo.getProperties(prefix),
            this.sourceInfo.getProperties(prefix),
            this.categoryInfo.getProperties(prefix),
            this.conceptInfo.getProperties(prefix),
            this.locationInfo.getProperties(prefix),
            this.storyInfo.getProperties(prefix),
            this.conceptClassInfo.getProperties(prefix),
            this.conceptFolderInfo.getProperties(prefix),
        );
    }
}

export class ArticleInfoFlags extends ReturnInfoFlagsBase<ER.ReturnInfo.ArticleInfoFlags> {
    constructor(params: ER.ReturnInfo.ArticleInfo = {}) {
        super();
        this.type = "Article";
        this.setValue("bodyLen", params, 300);
        this.setFlag("basicInfo", params, true);
        this.setFlag("title", params, true);
        this.setFlag("body", params, true);
        this.setFlag("url", params, true);
        this.setFlag("eventUri", params, true);
        this.setFlag("concepts", params, false);
        this.setFlag("categories", params, false);
        this.setFlag("links", params, false);
        this.setFlag("videos", params, false);
        this.setFlag("image", params, false);
        this.setFlag("socialScore", params, false);
        this.setFlag("sentiment", params, false);
        this.setFlag("location", params, false);
        this.setFlag("dates", params, false);
        this.setFlag("extractedDates", params, false);
        this.setFlag("duplicateList", params, false);
        this.setFlag("originalArticle", params, false);
        this.setFlag("storyUri", params, false);
    }
}

export class StoryInfoFlags extends ReturnInfoFlagsBase<ER.ReturnInfo.StoryInfoFlags> {
    constructor(params: ER.ReturnInfo.StoryInfo = {}) {
        super();
        this.type = "Story";
        this.setFlag("basicStats", params, true);
        this.setFlag("location", params, true);
        this.setFlag("date", params, false);
        this.setFlag("title", params, false);
        this.setFlag("summary", params, false);
        this.setFlag("concepts", params, false);
        this.setFlag("categories", params, false);
        this.setFlag("medoidArticle", params, false);
        this.setFlag("infoArticle", params, false);
        this.setFlag("commonDates", params, false);
        this.setFlag("socialScore", params, false);
        this.setValue("imageCount", params, 0);
    }
}

export class EventInfoFlags extends ReturnInfoFlagsBase<ER.ReturnInfo.EventInfoFlags> {
    constructor(params: ER.ReturnInfo.EventInfo = {}) {
        super();
        this.type = "Event";
        this.setFlag("title", params, true);
        this.setFlag("summary", params, true);
        this.setFlag("articleCounts", params, true);
        this.setFlag("concepts", params, true);
        this.setFlag("categories", params, true);
        this.setFlag("location", params, true);
        this.setFlag("date", params, true);
        this.setFlag("commonDates", params, false);
        this.setFlag("infoArticle", params, false);
        this.setFlag("stories", params, false);
        this.setFlag("socialScore", params, false);
        this.setValue("imageCount", params, 0);
    }
}

export class SourceInfoFlags extends ReturnInfoFlagsBase<ER.ReturnInfo.SourceInfoFlags> {
    constructor(params: ER.ReturnInfo.SourceInfo = {}) {
        super();
        this.type = "Source";
        this.setFlag("title", params, true);
        this.setFlag("description", params, false);
        this.setFlag("location", params, false);
        this.setFlag("ranking", params, false);
        this.setFlag("image", params, false);
        this.setFlag("articleCount", params, false);
        this.setFlag("sourceMedia", params, false);
        this.setFlag("sourceGroups", params, false);
    }
}

export class CategoryInfoFlags extends ReturnInfoFlagsBase<ER.ReturnInfo.CategoryInfoFlags> {
    constructor(params: ER.ReturnInfo.CategoryInfo = {}) {
        super();
        this.type = "Category";
        this.setFlag("parentUri", params, false);
        this.setFlag("childrenUris", params, false);
        this.setFlag("trendingScore", params, false);
        this.setFlag("trendingHistory", params, false);
        this.setValue("trendingSource", params, "news");
    }
}

export class ConceptInfoFlags extends ReturnInfoFlagsBase<ER.ReturnInfo.ConceptInfoFlags> {
    constructor(params: ER.ReturnInfo.ConceptInfo = {}) {
        super();
        this.type = "Concept";
        this.setValue("type", params, "concepts");
        this.setValue("lang", params, "eng");
        this.setFlag("label", params, true);
        this.setFlag("synonyms", params, false);
        this.setFlag("image", params, false);
        this.setFlag("description", params, false);
        this.setFlag("conceptClassMembership", params, false);
        this.setFlag("conceptClassMembershipFull", params, false);
        this.setFlag("trendingScore", params, false);
        this.setFlag("trendingHistory", params, false);
        this.setFlag("totalCount", params, false);
        this.setValue("trendingSource", params, "news");
        this.setValue("maxConceptsPerType", params, 20, true);
    }
}

export class LocationInfoFlags extends ReturnInfoFlagsBase<ER.ReturnInfo.LocationInfoFlags> {
    constructor(params: ER.ReturnInfo.LocationInfo = {}) {
        super();
        this.type = "Location";
        this.setFlag("label", params, true);
        this.setFlag("wikiUri", params, false);
        this.setFlag("geoNamesId", params, false);
        this.setFlag("population", params, false);
        this.setFlag("geoLocation", params, false);
        this.setFlag("countryArea", params, false);
        this.setFlag("countryDetails", params, false);
        this.setFlag("countryContinent", params, false);
        this.setFlag("placeFeatureCode", params, false);
        this.setFlag("placeCountry", params, true);
    }
}

export class ConceptClassInfoFlags extends ReturnInfoFlagsBase<ER.ReturnInfo.ConceptClassInfoFlags> {
    constructor(params: ER.ReturnInfo.ConceptClassInfo = {}) {
        super();
        this.type = "ConceptClass";
        this.setFlag("parentLabels", params, true);
        this.setFlag("concepts", params, false);
    }
}

export class ConceptFolderInfoFlags extends ReturnInfoFlagsBase<ER.ReturnInfo.ConceptFolderInfoFlags> {
    constructor(params: ER.ReturnInfo.ConceptFolderInfo = {}) {
        super();
        this.type = "ConceptFolder";
        this.setFlag("definition", params, true);
        this.setFlag("owner", params, false);
    }
}
