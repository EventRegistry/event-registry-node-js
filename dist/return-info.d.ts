export declare const enum DataType {
    Article = "Article",
    Event = "Event",
    Story = "Story",
    Source = "Source",
    Category = "Category",
    Concept = "Concept",
    Location = "Location",
    ConceptClass = "ConceptClass",
    ConceptFolder = "ConceptFolder",
}
export declare const enum ConceptType {
    Person = "person",
    Location = "loc",
    Organization = "org",
    Wiki = "wiki",
    Concepts = "concepts",
    ConceptClass = "conceptClass",
    ConceptFolder = "conceptFolder",
}
export interface IArticleInfo {
    ArticleBodyLen?: number;
    IncludeArticleBasicInfo?: boolean;
    IncludeArticleTitle?: boolean;
    IncludeArticleBody?: boolean;
    IncludeArticleUrl?: boolean;
    IncludeArticleEventUri?: boolean;
    IncludeArticleConcepts?: boolean;
    IncludeArticleCategories?: boolean;
    IncludeArticleVideos?: boolean;
    IncludeArticleImage?: boolean;
    IncludeArticleSocialScore?: boolean;
    IncludeArticleLocation?: boolean;
    IncludeArticleDates?: boolean;
    IncludeArticleExtractedDates?: boolean;
    IncludeArticleDuplicateList?: boolean;
    IncludeArticleOriginalArticle?: boolean;
    IncludeArticleStoryUri?: boolean;
    IncludeArticleDetails?: boolean;
}
export interface IStoryInfo {
    IncludeStoryBasicStats?: boolean;
    IncludeStoryLocation?: boolean;
    IncludeStoryCategories?: boolean;
    IncludeStoryDate?: boolean;
    IncludeStoryConcepts?: boolean;
    IncludeStoryTitle?: boolean;
    IncludeStorySummary?: boolean;
    IncludeStoryMedoidArticle?: boolean;
    IncludeStoryCommonDates?: boolean;
    IncludeStorySocialScore?: boolean;
    IncludeStoryDetails?: boolean;
    StoryImageCount?: number;
}
export interface IEventInfo {
    IncludeEventTitle?: boolean;
    IncludeEventSummary?: boolean;
    IncludeEventArticleCounts?: boolean;
    IncludeEventConcepts?: boolean;
    IncludeEventCategories?: boolean;
    IncludeEventLocation?: boolean;
    IncludeEventDate?: boolean;
    IncludeEventCommonDates?: boolean;
    IncludeEventStories?: boolean;
    IncludeEventSocialScore?: boolean;
    IncludeEventDetails?: boolean;
    EventImageCount?: number;
}
export interface ISourceInfo {
    IncludeSourceTitle?: boolean;
    IncludeSourceDescription?: boolean;
    IncludeSourceLocation?: boolean;
    IncludeSourceRanking?: boolean;
    IncludeSourceImage?: boolean;
    IncludeSourceArticleCount?: boolean;
    IncludeSourceSourceGroups?: boolean;
    IncludeSourceDetails?: boolean;
}
export interface ICategoryInfo {
    IncludeCategoryParentUri?: boolean;
    IncludeCategoryChildrenUris?: boolean;
    IncludeCategoryTrendingScore?: boolean;
    IncludeCategoryTrendingHistory?: boolean;
    IncludeCategoryDetails?: boolean;
    CategoryTrendingSource?: string | string[];
}
export interface IConceptInfo {
    ConceptType?: ConceptType;
    ConceptLang?: string | string[];
    IncludeConceptLabel?: boolean;
    IncludeConceptSynonyms?: boolean;
    IncludeConceptImage?: boolean;
    IncludeConceptDescription?: boolean;
    IncludeConceptDetails?: boolean;
    IncludeConceptConceptClassMembership?: boolean;
    IncludeConceptConceptClassMembershipFull?: boolean;
    IncludeConceptTrendingScore?: boolean;
    IncludeConceptTrendingHistory?: boolean;
    IncludeConceptTotalCount?: boolean;
    ConceptTrendingSource?: string | string[];
    MaxConceptsPerType?: number;
}
export interface ILocationInfo {
    IncludeLocationLabel?: boolean;
    IncludeLocationWikiUri?: boolean;
    IncludeLocationGeoNamesId?: boolean;
    IncludeLocationPopulation?: boolean;
    IncludeLocationGeoLocation?: boolean;
    IncludeLocationCountryArea?: boolean;
    IncludeLocationCountryDetails?: boolean;
    IncludeLocationCountryContinent?: boolean;
    IncludeLocationPlaceFeatureCode?: boolean;
    IncludeLocationPlaceCountry?: boolean;
}
export interface IConceptClassInfo {
    IncludeConceptClassParentLabels?: boolean;
    IncludeConceptClassConcepts?: boolean;
    IncludeConceptClassDetails?: boolean;
}
export interface IConceptFolderInfo {
    IncludeConceptFolderDefinition?: boolean;
    IncludeConceptFolderOwner?: boolean;
    IncludeConceptFolderDetails?: boolean;
}
export declare abstract class ReturnInfo<T> {
    protected abstract defaultProperties: T;
    protected abstract prefix: DataType;
    private _data;
    setFlag(key: any, value: any): void;
    setValue(key: any, value: any): void;
    properties: T;
    private _setProperty(key, value);
    private _hasProperty(key);
}
export declare class ArticleInfo extends ReturnInfo<IArticleInfo> {
    protected prefix: DataType;
    protected defaultProperties: IArticleInfo;
}
export declare class StoryInfo extends ReturnInfo<IStoryInfo> {
    protected prefix: DataType;
    protected defaultProperties: IStoryInfo;
}
export declare class EventInfo extends ReturnInfo<IEventInfo> {
    protected prefix: DataType;
    protected defaultProperties: IEventInfo;
}
export declare class SourceInfo extends ReturnInfo<ISourceInfo> {
    protected prefix: DataType;
    protected defaultProperties: ISourceInfo;
}
export declare class CategoryInfo extends ReturnInfo<ICategoryInfo> {
    protected prefix: DataType;
    protected defaultProperties: ICategoryInfo;
}
export declare class ConceptInfo extends ReturnInfo<IConceptInfo> {
    protected prefix: DataType;
    protected defaultProperties: IConceptInfo;
}
export declare class LocationInfo extends ReturnInfo<ILocationInfo> {
    protected prefix: DataType;
    protected defaultProperties: ILocationInfo;
}
export declare class ConceptClassInfo extends ReturnInfo<IConceptClassInfo> {
    protected prefix: DataType;
    protected defaultProperties: IConceptClassInfo;
}
export declare class ConceptFolderInfo extends ReturnInfo<IConceptFolderInfo> {
    protected prefix: DataType;
    protected defaultProperties: IConceptFolderInfo;
}
