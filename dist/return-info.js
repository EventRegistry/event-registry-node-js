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
var ReturnInfo = /** @class */ (function () {
    function ReturnInfo() {
    }
    ReturnInfo.prototype.setFlag = function (key, value) {
        this._setProperty("Include" + this.prefix + key, value);
    };
    ReturnInfo.prototype.setValue = function (key, value) {
        this._setProperty(this.prefix + key, value);
    };
    Object.defineProperty(ReturnInfo.prototype, "properties", {
        get: function () {
            var _this = this;
            return _.pickBy(this._data, function (value, key) {
                return _this.defaultProperties[key] !== value;
            });
        },
        set: function (properties) {
            this._data = properties;
        },
        enumerable: true,
        configurable: true
    });
    ReturnInfo.prototype._setProperty = function (key, value) {
        if (this._hasProperty(key)) {
            this._data[key] = value;
        }
        else {
            throw new Error("Property is not part of the declared ReturnInfo object");
        }
    };
    ReturnInfo.prototype._hasProperty = function (key) {
        return _.has(this.defaultProperties, key);
    };
    return ReturnInfo;
}());
exports.ReturnInfo = ReturnInfo;
var ArticleInfo = /** @class */ (function (_super) {
    __extends(ArticleInfo, _super);
    function ArticleInfo() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.prefix = "Article" /* Article */;
        _this.defaultProperties = {
            ArticleBodyLen: 300,
            IncludeArticleBasicInfo: true,
            IncludeArticleTitle: true,
            IncludeArticleBody: true,
            IncludeArticleUrl: true,
            IncludeArticleEventUri: true,
            IncludeArticleConcepts: false,
            IncludeArticleCategories: false,
            IncludeArticleVideos: false,
            IncludeArticleImage: false,
            IncludeArticleSocialScore: false,
            IncludeArticleLocation: false,
            IncludeArticleDates: false,
            IncludeArticleExtractedDates: false,
            IncludeArticleDuplicateList: false,
            IncludeArticleOriginalArticle: false,
            IncludeArticleStoryUri: false,
            IncludeArticleDetails: false,
        };
        return _this;
    }
    return ArticleInfo;
}(ReturnInfo));
exports.ArticleInfo = ArticleInfo;
var StoryInfo = /** @class */ (function (_super) {
    __extends(StoryInfo, _super);
    function StoryInfo() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.prefix = "Story" /* Story */;
        _this.defaultProperties = {
            IncludeStoryBasicStats: true,
            IncludeStoryLocation: true,
            IncludeStoryCategories: false,
            IncludeStoryDate: false,
            IncludeStoryConcepts: false,
            IncludeStoryTitle: false,
            IncludeStorySummary: false,
            IncludeStoryMedoidArticle: false,
            IncludeStoryCommonDates: false,
            IncludeStorySocialScore: false,
            IncludeStoryDetails: false,
            StoryImageCount: 0,
        };
        return _this;
    }
    return StoryInfo;
}(ReturnInfo));
exports.StoryInfo = StoryInfo;
var EventInfo = /** @class */ (function (_super) {
    __extends(EventInfo, _super);
    function EventInfo() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.prefix = "Event" /* Event */;
        _this.defaultProperties = {
            IncludeEventTitle: true,
            IncludeEventSummary: true,
            IncludeEventArticleCounts: true,
            IncludeEventConcepts: true,
            IncludeEventCategories: true,
            IncludeEventLocation: true,
            IncludeEventDate: true,
            IncludeEventCommonDates: false,
            IncludeEventStories: false,
            IncludeEventSocialScore: false,
            IncludeEventDetails: false,
            EventImageCount: 0,
        };
        return _this;
    }
    return EventInfo;
}(ReturnInfo));
exports.EventInfo = EventInfo;
var SourceInfo = /** @class */ (function (_super) {
    __extends(SourceInfo, _super);
    function SourceInfo() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.prefix = "Source" /* Source */;
        _this.defaultProperties = {
            IncludeSourceTitle: true,
            IncludeSourceDescription: false,
            IncludeSourceLocation: false,
            IncludeSourceRanking: false,
            IncludeSourceImage: false,
            IncludeSourceArticleCount: false,
            IncludeSourceSourceGroups: false,
            IncludeSourceDetails: false,
        };
        return _this;
    }
    return SourceInfo;
}(ReturnInfo));
exports.SourceInfo = SourceInfo;
var CategoryInfo = /** @class */ (function (_super) {
    __extends(CategoryInfo, _super);
    function CategoryInfo() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.prefix = "Category" /* Category */;
        _this.defaultProperties = {
            IncludeCategoryParentUri: false,
            IncludeCategoryChildrenUris: false,
            IncludeCategoryTrendingScore: false,
            IncludeCategoryTrendingHistory: false,
            IncludeCategoryDetails: false,
            CategoryTrendingSource: "news",
        };
        return _this;
    }
    return CategoryInfo;
}(ReturnInfo));
exports.CategoryInfo = CategoryInfo;
var ConceptInfo = /** @class */ (function (_super) {
    __extends(ConceptInfo, _super);
    function ConceptInfo() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.prefix = "Concept" /* Concept */;
        _this.defaultProperties = {
            ConceptType: "concepts" /* Concepts */,
            ConceptLang: "eng",
            IncludeConceptLabel: true,
            IncludeConceptSynonyms: false,
            IncludeConceptImage: false,
            IncludeConceptDescription: false,
            IncludeConceptDetails: false,
            IncludeConceptConceptClassMembership: false,
            IncludeConceptConceptClassMembershipFull: false,
            IncludeConceptTrendingScore: false,
            IncludeConceptTrendingHistory: false,
            IncludeConceptTotalCount: false,
            ConceptTrendingSource: "news",
            MaxConceptsPerType: 20,
        };
        return _this;
    }
    return ConceptInfo;
}(ReturnInfo));
exports.ConceptInfo = ConceptInfo;
var LocationInfo = /** @class */ (function (_super) {
    __extends(LocationInfo, _super);
    function LocationInfo() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.prefix = "Location" /* Location */;
        _this.defaultProperties = {
            IncludeLocationLabel: true,
            IncludeLocationWikiUri: false,
            IncludeLocationGeoNamesId: false,
            IncludeLocationPopulation: false,
            IncludeLocationGeoLocation: false,
            IncludeLocationCountryArea: false,
            IncludeLocationCountryDetails: false,
            IncludeLocationCountryContinent: false,
            IncludeLocationPlaceFeatureCode: false,
            IncludeLocationPlaceCountry: true,
        };
        return _this;
    }
    return LocationInfo;
}(ReturnInfo));
exports.LocationInfo = LocationInfo;
var ConceptClassInfo = /** @class */ (function (_super) {
    __extends(ConceptClassInfo, _super);
    function ConceptClassInfo() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.prefix = "ConceptClass" /* ConceptClass */;
        _this.defaultProperties = {
            IncludeConceptClassParentLabels: true,
            IncludeConceptClassConcepts: false,
            IncludeConceptClassDetails: false,
        };
        return _this;
    }
    return ConceptClassInfo;
}(ReturnInfo));
exports.ConceptClassInfo = ConceptClassInfo;
var ConceptFolderInfo = /** @class */ (function (_super) {
    __extends(ConceptFolderInfo, _super);
    function ConceptFolderInfo() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.prefix = "ConceptFolder" /* ConceptFolder */;
        _this.defaultProperties = {
            IncludeConceptFolderDefinition: true,
            IncludeConceptFolderOwner: false,
            IncludeConceptFolderDetails: false,
        };
        return _this;
    }
    return ConceptFolderInfo;
}(ReturnInfo));
exports.ConceptFolderInfo = ConceptFolderInfo;
