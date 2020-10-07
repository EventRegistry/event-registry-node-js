import * as _ from "lodash";
import { EventRegistryStatic } from "./types";
import * as fs from "fs";

export abstract class ReturnInfoFlagsBase<T extends {}> {
    protected type: string;
    private data = {};

    public setFlag(key: string, value: boolean, defaultValue?: boolean) {
        this.setProperty("Include" + this.type + _.upperFirst(key), value, defaultValue);
    }

    public setValue(key: string, value: any, defaultValue?: any, skipKeyMod = false) {
        const constructedKey = skipKeyMod ? _.upperFirst(key) : this.type + _.upperFirst(key);
        this.setProperty(constructedKey, value, defaultValue);
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

    public addProperties(properties: object) {
        if (properties instanceof Object) {
            for (const name in properties) {
                if (properties.hasOwnProperty(name)) {
                    const value = properties[name];
                    if (typeof value === "boolean") {
                        this.setFlag(name, value, !value);
                    } else {
                        this.setValue(name, value);
                    }
                }
            }
        }
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
            ...unsupported
        } = {}) {
        if (!_.isEmpty(unsupported)) {
            console.warn(`ReturnInfo: Unsupported parameters detected: ${JSON.stringify(unsupported)}. Please check the documentation.`);
        }
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

    public getParams(prefix?: string) {
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

    /**
     * load the configuration for the ReturnInfo from a filename
     * @param filename filename that contains the json configuration to use in the ReturnInfo
     */
    public static loadFromFile(filename: string): ReturnInfo {
        if (!(fs && fs.existsSync(filename))) {
            throw new Error(`File ${filename} does not exist`);
        }
        const conf = JSON.parse(fs.readFileSync(filename, "utf8"));
        return new ReturnInfo({
            articleInfo: new ArticleInfoFlags(_.get(conf, "articleInfo", {})),
            eventInfo: new EventInfoFlags(_.get(conf, "eventInfo", {})),
            sourceInfo: new SourceInfoFlags(_.get(conf, "sourceInfo", {})),
            categoryInfo: new CategoryInfoFlags(_.get(conf, "categoryInfo", {})),
            conceptInfo: new ConceptInfoFlags(_.get(conf, "conceptInfo", {})),
            locationInfo: new LocationInfoFlags(_.get(conf, "locationInfo", {})),
            storyInfo: new StoryInfoFlags(_.get(conf, "storyInfo", {})),
            conceptClassInfo: new ConceptClassInfoFlags(_.get(conf, "conceptClassInfo", {})),
            conceptFolderInfo: new ConceptFolderInfoFlags(_.get(conf, "conceptFolderInfo", {})),
        });
    }
}

export class ArticleInfoFlags extends ReturnInfoFlagsBase<EventRegistryStatic.ReturnInfo.ArticleInfoFlags> {
    constructor(params: EventRegistryStatic.ReturnInfo.ArticleInfo = {}) {
        super();
        this.type = "Article";
        const {
            bodyLen = -1,
            basicInfo = true,
            title = true,
            body = true,
            url = true,
            eventUri = true,
            authors = true,
            concepts = false,
            categories = false,
            links = false,
            videos = false,
            image = true,
            socialScore = false,
            sentiment = true,
            location = false,
            extractedDates = false,
            originalArticle = false,
            storyUri = false,
            ...properties
        } = params;
        this.setValue("bodyLen", bodyLen);
        this.setFlag("basicInfo", basicInfo);
        this.setFlag("title", title);
        this.setFlag("body", body);
        this.setFlag("url", url);
        this.setFlag("eventUri", eventUri);
        this.setFlag("authors", authors);
        this.setFlag("concepts", concepts);
        this.setFlag("categories", categories);
        this.setFlag("links", links);
        this.setFlag("videos", videos);
        this.setFlag("image", image);
        this.setFlag("socialScore", socialScore);
        this.setFlag("sentiment", sentiment);
        this.setFlag("location", location);
        this.setFlag("extractedDates", extractedDates);
        this.setFlag("originalArticle", originalArticle);
        this.setFlag("storyUri", storyUri);
        this.addProperties(properties);
    }
}

export class StoryInfoFlags extends ReturnInfoFlagsBase<EventRegistryStatic.ReturnInfo.StoryInfoFlags> {
    constructor(params: EventRegistryStatic.ReturnInfo.StoryInfo = {}) {
        super();
        this.type = "Story";
        const {
            basicStats = true,
            location = true,
            date = false,
            title = false,
            summary = false,
            concepts = false,
            categories = false,
            medoidArticle = false,
            infoArticle = false,
            commonDates = false,
            socialScore = false,
            imageCount = 0,
            ...properties
        } = params;
        this.setFlag("basicStats", basicStats);
        this.setFlag("location", location);
        this.setFlag("date", date);
        this.setFlag("title", title);
        this.setFlag("summary", summary);
        this.setFlag("concepts", concepts);
        this.setFlag("categories", categories);
        this.setFlag("medoidArticle", medoidArticle);
        this.setFlag("infoArticle", infoArticle);
        this.setFlag("commonDates", commonDates);
        this.setFlag("socialScore", socialScore);
        this.setValue("imageCount", imageCount);
        this.addProperties(properties);
    }
}

export class EventInfoFlags extends ReturnInfoFlagsBase<EventRegistryStatic.ReturnInfo.EventInfoFlags> {
    constructor(params: EventRegistryStatic.ReturnInfo.EventInfo = {}) {
        super();
        this.type = "Event";
        const {
            title = true,
            summary = true,
            articleCounts = true,
            concepts = true,
            categories = true,
            date = true,
            commonDates = false,
            infoArticle = false,
            stories = false,
            socialScore = false,
            imageCount = 0,
            ...properties
        } = params;
        this.setFlag("title", title);
        this.setFlag("summary", summary);
        this.setFlag("articleCounts", articleCounts);
        this.setFlag("concepts", concepts);
        this.setFlag("categories", categories);
        this.setFlag("date", date);
        this.setFlag("commonDates", commonDates);
        this.setFlag("infoArticle", infoArticle as boolean);
        this.setFlag("stories", stories);
        this.setFlag("socialScore", socialScore);
        this.setValue("imageCount", imageCount);
        this.addProperties(properties);
    }
}

export class SourceInfoFlags extends ReturnInfoFlagsBase<EventRegistryStatic.ReturnInfo.SourceInfoFlags> {
    constructor(params: EventRegistryStatic.ReturnInfo.SourceInfo = {}) {
        super();
        const {
            title = true,
            description = false,
            location = false,
            ranking = false,
            image = false,
            socialMedia = false,
            ...properties
        } = params;
        this.type = "Source";
        this.setFlag("title", title);
        this.setFlag("description", description);
        this.setFlag("location", location);
        this.setFlag("ranking", ranking);
        this.setFlag("image", image);
        this.setFlag("socialMedia", socialMedia);
        this.addProperties(properties);
    }
}

export class CategoryInfoFlags extends ReturnInfoFlagsBase<EventRegistryStatic.ReturnInfo.CategoryInfoFlags> {
    constructor(params: EventRegistryStatic.ReturnInfo.CategoryInfo = {}) {
        super();
        this.type = "Category";
        const {
            trendingScore = true,
            ...properties
        } = params;
        this.setFlag("trendingScore", trendingScore);
        this.addProperties(properties);
    }
}

export class ConceptInfoFlags extends ReturnInfoFlagsBase<EventRegistryStatic.ReturnInfo.ConceptInfoFlags> {
    constructor(params: EventRegistryStatic.ReturnInfo.ConceptInfo = {}) {
        super();
        this.type = "Concept";
        const {
            type = "concepts",
            lang = "eng",
            label = true,
            synonyms = false,
            image = false,
            description = false,
            trendingScore = false,
            maxConceptsPerType = 20,
            ...properties
        } = params;
        this.setValue("type", type);
        this.setValue("lang", lang);
        this.setFlag("label", label);
        this.setFlag("synonyms", synonyms);
        this.setFlag("image", image);
        this.setFlag("description", description);
        this.setFlag("trendingScore", trendingScore);
        this.setValue("maxConceptsPerType", maxConceptsPerType, 20, true);
        this.addProperties(properties);
    }
}

export class LocationInfoFlags extends ReturnInfoFlagsBase<EventRegistryStatic.ReturnInfo.LocationInfoFlags> {
    constructor(params: EventRegistryStatic.ReturnInfo.LocationInfo = {}) {
        super();
        this.type = "Location";
        const {
            label = true,
            wikiUri = false,
            geoNamesId = false,
            population = false,
            geoLocation = false,
            countryArea = false,
            countryDetails = false,
            countryContinent = false,
            placeFeatureCode = false,
            placeCountry = true,
            ...properties
        } = params;
        this.setFlag("label", label);
        this.setFlag("wikiUri", wikiUri);
        this.setFlag("geoNamesId", geoNamesId);
        this.setFlag("population", population);
        this.setFlag("geoLocation", geoLocation);
        this.setFlag("countryArea", countryArea);
        this.setFlag("countryDetails", countryDetails);
        this.setFlag("countryContinent", countryContinent);
        this.setFlag("placeFeatureCode", placeFeatureCode);
        this.setFlag("placeCountry", placeCountry);
        this.addProperties(properties);
    }
}

export class ConceptClassInfoFlags extends ReturnInfoFlagsBase<EventRegistryStatic.ReturnInfo.ConceptClassInfoFlags> {
    constructor(params: EventRegistryStatic.ReturnInfo.ConceptClassInfo = {}) {
        super();
        this.type = "ConceptClass";
        const {
            parentLabels = true,
            concepts = false,
            ...properties
        } = params;
        this.setFlag("parentLabels", parentLabels);
        this.setFlag("concepts", concepts);
        this.addProperties(properties);
    }
}

export class ConceptFolderInfoFlags extends ReturnInfoFlagsBase<EventRegistryStatic.ReturnInfo.ConceptFolderInfoFlags> {
    constructor(params: EventRegistryStatic.ReturnInfo.ConceptFolderInfo = {}) {
        super();
        this.type = "ConceptFolder";
        const {
            definition = true,
            owner = false,
            ...properties
        } = params;
        this.setFlag("owner", definition);
        this.setFlag("owner", owner);
        this.addProperties(properties);
    }
}
