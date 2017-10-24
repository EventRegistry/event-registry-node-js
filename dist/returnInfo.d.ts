/// <reference types="lodash" />
import * as _ from "lodash";
import { ER } from "./types";
export declare abstract class ReturnInfoFlagsBase<T extends {}> {
    protected type: string;
    private data;
    constructor(params?: {});
    setFlag(key: any, obj: any, defaultValue: any): void;
    setValue(key: any, obj: any, defaultValue: any, skipKeyMod?: boolean): void;
    getProperties(prefix?: string): _.Dictionary<{}>;
    protected abstract init(params: any): any;
    private setProperty(key, value, defaultValue);
}
export declare class ReturnInfo {
    private articleInfo;
    private eventInfo;
    private sourceInfo;
    private categoryInfo;
    private conceptInfo;
    private locationInfo;
    private storyInfo;
    private conceptClassInfo;
    private conceptFolderInfo;
    constructor({articleInfo, eventInfo, sourceInfo, categoryInfo, conceptInfo, locationInfo, storyInfo, conceptClassInfo, conceptFolderInfo}?: {
        articleInfo?: ArticleInfoFlags;
        eventInfo?: EventInfoFlags;
        sourceInfo?: SourceInfoFlags;
        categoryInfo?: CategoryInfoFlags;
        conceptInfo?: ConceptInfoFlags;
        locationInfo?: LocationInfoFlags;
        storyInfo?: StoryInfoFlags;
        conceptClassInfo?: ConceptClassInfoFlags;
        conceptFolderInfo?: ConceptFolderInfoFlags;
    });
    getParams(prefix?: any): {};
}
export declare class ArticleInfoFlags extends ReturnInfoFlagsBase<ER.ReturnInfo.ArticleInfoFlags> {
    protected init(params: ER.ReturnInfo.ArticleInfo): void;
}
export declare class StoryInfoFlags extends ReturnInfoFlagsBase<ER.ReturnInfo.StoryInfoFlags> {
    protected init(params: ER.ReturnInfo.StoryInfo): void;
}
export declare class EventInfoFlags extends ReturnInfoFlagsBase<ER.ReturnInfo.EventInfoFlags> {
    protected init(params: ER.ReturnInfo.EventInfo): void;
}
export declare class SourceInfoFlags extends ReturnInfoFlagsBase<ER.ReturnInfo.SourceInfoFlags> {
    protected init(params: ER.ReturnInfo.SourceInfo): void;
}
export declare class CategoryInfoFlags extends ReturnInfoFlagsBase<ER.ReturnInfo.CategoryInfoFlags> {
    protected init(params: ER.ReturnInfo.CategoryInfo): void;
}
export declare class ConceptInfoFlags extends ReturnInfoFlagsBase<ER.ReturnInfo.ConceptInfoFlags> {
    protected init(params: ER.ReturnInfo.ConceptInfo): void;
}
export declare class LocationInfoFlags extends ReturnInfoFlagsBase<ER.ReturnInfo.LocationInfoFlags> {
    protected init(params: ER.ReturnInfo.LocationInfo): void;
}
export declare class ConceptClassInfoFlags extends ReturnInfoFlagsBase<ER.ReturnInfo.ConceptClassInfoFlags> {
    protected init(params: ER.ReturnInfo.ConceptClassInfo): void;
}
export declare class ConceptFolderInfoFlags extends ReturnInfoFlagsBase<ER.ReturnInfo.ConceptFolderInfoFlags> {
    protected init(params: ER.ReturnInfo.ConceptFolderInfo): void;
}
