// tslint:disable-next-line:no-namespace
declare namespace jasmine {
    interface Matchers<T> {
        toBeValidConcept(): boolean;
        toBeValidArticle(): boolean;
        toBeValidGeneralArticleList(): boolean;    
        toBeValidCategory(): boolean;
        toBeValidSource(): boolean;
        toBeValidEvent(): boolean;
        toBeValidGeneralEventList(): boolean;    
        toBeValidStory(): boolean;
        toContainConcept(test1: string): boolean;
        toContainSource(test1: string): boolean;
        toContainCategory(test1: string): boolean;
        toContainBodyText(test1: string): boolean;
        toHaveProperty(propName: string): boolean;
    }
}