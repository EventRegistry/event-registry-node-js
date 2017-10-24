"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
var ReturnInfoFlagsBase = /** @class */ (function () {
    // Initialize all the possible parameters
    function ReturnInfoFlagsBase(params) {
        if (params === void 0) { params = {}; }
        this.data = {};
        this.init(params);
    }
    ReturnInfoFlagsBase.prototype.setFlag = function (key, obj, defaultValue) {
        if (_.has(obj, key)) {
            this.setProperty("Include" + this.type + _.upperFirst(key), obj[key], defaultValue);
        }
    };
    ReturnInfoFlagsBase.prototype.setValue = function (key, obj, defaultValue, skipKeyMod) {
        if (skipKeyMod === void 0) { skipKeyMod = false; }
        if (_.has(obj, key)) {
            var constructedKey = skipKeyMod ? _.upperFirst(key) : this.type + _.upperFirst(key);
            this.setProperty(constructedKey, obj[key], defaultValue);
        }
    };
    ReturnInfoFlagsBase.prototype.getProperties = function (prefix) {
        if (prefix === void 0) { prefix = ""; }
        return _.mapKeys(this.data, function (value, key) {
            if (_.startsWith(_.toLower(key), _.toLower(prefix))) {
                return _.camelCase(key);
            }
            else {
                return _.camelCase(prefix + key);
            }
        });
    };
    ReturnInfoFlagsBase.prototype.setProperty = function (key, value, defaultValue) {
        if (value !== defaultValue) {
            _.set(this.data, key, value);
        }
    };
    return ReturnInfoFlagsBase;
}());
exports.ReturnInfoFlagsBase = ReturnInfoFlagsBase;
var ReturnInfo = /** @class */ (function () {
    // Accepts all InfoFlags
    function ReturnInfo(_a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.articleInfo, articleInfo = _c === void 0 ? new ArticleInfoFlags() : _c, _d = _b.eventInfo, eventInfo = _d === void 0 ? new EventInfoFlags() : _d, _e = _b.sourceInfo, sourceInfo = _e === void 0 ? new SourceInfoFlags() : _e, _f = _b.categoryInfo, categoryInfo = _f === void 0 ? new CategoryInfoFlags() : _f, _g = _b.conceptInfo, conceptInfo = _g === void 0 ? new ConceptInfoFlags() : _g, _h = _b.locationInfo, locationInfo = _h === void 0 ? new LocationInfoFlags() : _h, _j = _b.storyInfo, storyInfo = _j === void 0 ? new StoryInfoFlags() : _j, _k = _b.conceptClassInfo, conceptClassInfo = _k === void 0 ? new ConceptClassInfoFlags() : _k, _l = _b.conceptFolderInfo, conceptFolderInfo = _l === void 0 ? new ConceptFolderInfoFlags() : _l;
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
    ReturnInfo.prototype.getParams = function (prefix) {
        return _.extend({}, this.articleInfo.getProperties(prefix), this.eventInfo.getProperties(prefix), this.sourceInfo.getProperties(prefix), this.categoryInfo.getProperties(prefix), this.conceptInfo.getProperties(prefix), this.locationInfo.getProperties(prefix), this.storyInfo.getProperties(prefix), this.conceptClassInfo.getProperties(prefix), this.conceptFolderInfo.getProperties(prefix));
    };
    return ReturnInfo;
}());
exports.ReturnInfo = ReturnInfo;
var ArticleInfoFlags = /** @class */ (function (_super) {
    __extends(ArticleInfoFlags, _super);
    function ArticleInfoFlags() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ArticleInfoFlags.prototype.init = function (params) {
        this.type = "Article";
        this.setValue("bodyLen", params, 300);
        this.setFlag("basicInfo", params, true);
        this.setFlag("title", params, true);
        this.setFlag("body", params, true);
        this.setFlag("url", params, true);
        this.setFlag("eventUri", params, true);
        this.setFlag("concepts", params, false);
        this.setFlag("categories", params, false);
        this.setFlag("videos", params, false);
        this.setFlag("image", params, false);
        this.setFlag("socialScore", params, false);
        this.setFlag("location", params, false);
        this.setFlag("dates", params, false);
        this.setFlag("extractedDates", params, false);
        this.setFlag("duplicateList", params, false);
        this.setFlag("originalArticle", params, false);
        this.setFlag("storyUri", params, false);
        this.setFlag("details", params, false);
    };
    return ArticleInfoFlags;
}(ReturnInfoFlagsBase));
exports.ArticleInfoFlags = ArticleInfoFlags;
var StoryInfoFlags = /** @class */ (function (_super) {
    __extends(StoryInfoFlags, _super);
    function StoryInfoFlags() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    StoryInfoFlags.prototype.init = function (params) {
        this.type = "Story";
        this.setFlag("basicStats", params, true);
        this.setFlag("location", params, true);
        this.setFlag("categories", params, false);
        this.setFlag("date", params, false);
        this.setFlag("concepts", params, false);
        this.setFlag("title", params, false);
        this.setFlag("summary", params, false);
        this.setFlag("medoidArticle", params, false);
        this.setFlag("commonDates", params, false);
        this.setFlag("socialScore", params, false);
        this.setFlag("details", params, false);
        this.setValue("imageCount", params, 0);
    };
    return StoryInfoFlags;
}(ReturnInfoFlagsBase));
exports.StoryInfoFlags = StoryInfoFlags;
var EventInfoFlags = /** @class */ (function (_super) {
    __extends(EventInfoFlags, _super);
    function EventInfoFlags() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    EventInfoFlags.prototype.init = function (params) {
        this.type = "Event";
        this.setFlag("title", params, true);
        this.setFlag("summary", params, true);
        this.setFlag("articleCounts", params, true);
        this.setFlag("concepts", params, true);
        this.setFlag("categories", params, true);
        this.setFlag("location", params, true);
        this.setFlag("date", params, true);
        this.setFlag("commonDates", params, false);
        this.setFlag("stories", params, false);
        this.setFlag("socialScore", params, false);
        this.setFlag("details", params, false);
        this.setValue("imageCount", params, 0);
    };
    return EventInfoFlags;
}(ReturnInfoFlagsBase));
exports.EventInfoFlags = EventInfoFlags;
var SourceInfoFlags = /** @class */ (function (_super) {
    __extends(SourceInfoFlags, _super);
    function SourceInfoFlags() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SourceInfoFlags.prototype.init = function (params) {
        this.type = "Source";
        this.setFlag("title", params, true);
        this.setFlag("description", params, false);
        this.setFlag("location", params, false);
        this.setFlag("ranking", params, false);
        this.setFlag("image", params, false);
        this.setFlag("articleCount", params, false);
        this.setFlag("sourceGroups", params, false);
        this.setFlag("details", params, false);
    };
    return SourceInfoFlags;
}(ReturnInfoFlagsBase));
exports.SourceInfoFlags = SourceInfoFlags;
var CategoryInfoFlags = /** @class */ (function (_super) {
    __extends(CategoryInfoFlags, _super);
    function CategoryInfoFlags() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CategoryInfoFlags.prototype.init = function (params) {
        this.type = "Category";
        this.setFlag("parentUri", params, false);
        this.setFlag("childrenUris", params, false);
        this.setFlag("trendingScore", params, false);
        this.setFlag("trendingHistory", params, false);
        this.setFlag("details", params, false);
        this.setValue("trendingSource", params, "news");
    };
    return CategoryInfoFlags;
}(ReturnInfoFlagsBase));
exports.CategoryInfoFlags = CategoryInfoFlags;
var ConceptInfoFlags = /** @class */ (function (_super) {
    __extends(ConceptInfoFlags, _super);
    function ConceptInfoFlags() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ConceptInfoFlags.prototype.init = function (params) {
        this.type = "Concept";
        this.setValue("type", params, "concepts");
        this.setValue("lang", params, "eng");
        this.setFlag("label", params, true);
        this.setFlag("synonyms", params, false);
        this.setFlag("image", params, false);
        this.setFlag("description", params, false);
        this.setFlag("details", params, false);
        this.setFlag("conceptClassMembership", params, false);
        this.setFlag("conceptClassMembershipFull", params, false);
        this.setFlag("trendingScore", params, false);
        this.setFlag("trendingHistory", params, false);
        this.setFlag("totalCount", params, false);
        this.setValue("trendingSource", params, "news");
        this.setValue("maxConceptsPerType", params, 20, true);
    };
    return ConceptInfoFlags;
}(ReturnInfoFlagsBase));
exports.ConceptInfoFlags = ConceptInfoFlags;
var LocationInfoFlags = /** @class */ (function (_super) {
    __extends(LocationInfoFlags, _super);
    function LocationInfoFlags() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    LocationInfoFlags.prototype.init = function (params) {
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
    };
    return LocationInfoFlags;
}(ReturnInfoFlagsBase));
exports.LocationInfoFlags = LocationInfoFlags;
var ConceptClassInfoFlags = /** @class */ (function (_super) {
    __extends(ConceptClassInfoFlags, _super);
    function ConceptClassInfoFlags() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ConceptClassInfoFlags.prototype.init = function (params) {
        this.type = "ConceptClass";
        this.setFlag("parentLabels", params, true);
        this.setFlag("concepts", params, false);
        this.setFlag("details", params, false);
    };
    return ConceptClassInfoFlags;
}(ReturnInfoFlagsBase));
exports.ConceptClassInfoFlags = ConceptClassInfoFlags;
var ConceptFolderInfoFlags = /** @class */ (function (_super) {
    __extends(ConceptFolderInfoFlags, _super);
    function ConceptFolderInfoFlags() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ConceptFolderInfoFlags.prototype.init = function (params) {
        this.type = "ConceptFolder";
        this.setFlag("definition", params, true);
        this.setFlag("owner", params, false);
        this.setFlag("details", params, false);
    };
    return ConceptFolderInfoFlags;
}(ReturnInfoFlagsBase));
exports.ConceptFolderInfoFlags = ConceptFolderInfoFlags;
//# sourceMappingURL=returnInfo.js.map