// This file contains type definitions of actual results (articles, events,...) from the API

export module Data {
    type TranslationObject = Record<string, string>;
    type Label = TranslationObject;
    type Summary = TranslationObject;
    type Shares = Record<string, number>;

    export interface Item {
        uri: string;
        label: string;
    }

    export interface Concept {
        uri: string;
        type: "person" | "loc" | "org" | "wiki";
        image: string;
        label: Label;
        conceptClassMembership: string[];
        location: Location;
        synonyms: Record<string, string[]>;
    }

    export interface Category {
        uri: string;
        parentUri: string;
        label: string;
    }

    export interface Country {
        area: number;
        code2: string;
        code3: string;
        continent: string;
        currencyCode: string;
        currencyName: string;
        geoNamesId: string;
        label: Label;
        lat: number;
        long: number;
        population: number;
        type: string;
        webExt: string;
        wikiUri: string;
    }

    export interface Location extends Country {

    }

    export interface SourceLocation {
        country: Country;
        featureCode: string;
        geoNamesId: string;
        label: Label;
        lat: number;
        long: number;
        population: number;
        type: string;
        wikiUri: string;
    }

    export interface EventLocation extends SourceLocation {

    }

    interface Source {
        uri: string;
        title: string;
        articleCount: number;
        description: string;
        socialMedia: Record<string, string>;
        ranking: {
            importanceRank: number;
            alexaGlobalRank: number;
            alexaCountryRank: number;
        };
        location: SourceLocation;
        sourceGroup: string[];
        image: string;
        thumbImage: string;
    }

    interface ExtractedDate {
        /**
         * Ambiguous?
         */
        amb: boolean;
        /**
         * Normalized date
         */
        date: string;
        dateEnd: string;
        detectedDate: string;
        /**
         * Was the year value imputed?
         */
        imp: boolean;
        /**
         * Location in text
         */
        posInText: number;
        textSnippet: string;
    }

    export interface Article {
        /**
         * Article's URI (unique article's ID - not necessarily a number)
         */
        uri: string;
        /**
         * Web url
         */
        url?: string;
        /**
         * Article's title
         */
        title?: string;
        /**
         * Article's full body
         */
        body?: string;
        /**
         * Date of publishing in UTC timezone
         */
        date: string;
        /**
         * Time of publishing in UTC timezone
         */
        time: string;
        /**
         * When was the article serialized. Each next article added to Event Registry has to have a higher value
         */
        dateTime: string;
        /**
         * When was the article first discovered in the RSS feeds. Value is closer to the actual time when the article was published,
         * but the value is not monotonically increasing as the articles are added to Event Registry
         */
        dateTimePub: string;
        /**
         * Type of the article (news, blog, pr)
         */
        dataType: "news" | "blog" | "pr";
        /**
         * Sentiment of the article (can be null if value is not set). Between -1 and 1.
         */
        sentiment?: number;
        /**
         * Event URI to which the article is assigned to (if any)
         */
        eventUri?: string;
        /**
         * Relevance represents how well does the article match the query - the higher the value, the better the match.
         * If search results are sorted by relevance, this is the value used for sorting
         */
        relevance: number;
        /**
         * Cluster/story URI to which the article is assigned to (if any)
         */
        storyUri?: string;
        /**
         * Details about the news source
         */
        source: Source;
        /**
         * List of categories
         */
        categories: Category[];
        /**
         * List of categories
         */
        concepts?: Concept[];
        links?: string[];
        videos?: Item[];
        /**
         * Article's image
         */
        image?: string;
        /**
         * If an article is a duplicate, this list will contain them
         */
        duplicateList?: Article[];
        /**
         * Dates that were extracted from the article
         */
        extractedDates?: ExtractedDate[];
        /**
         * Is article a duplicate of another article?
         */
        isDuplicate: boolean;
        /**
         * Language of the article
         */
        lang: string;
        /**
         * Was there explicit location extracted from dateline?
         */
        location: Location;
        /**
         * If this is a duplicate, this would be original article's object
         */
        originalArticle?: Article;
        /**
         * If this is a duplicate, this would be original article's object
         */
        sim: number;
        /**
         * Parameter used internally for sorting purposes (DO NOT USE THE VALUE)
         */
        wgt: number;
        /**
         * Number of shares on social media
         */
        shares: Shares;
    }

    export interface CommonDate {
        date: string;
        freq: number;
    }

    export interface Event {
        /**
         * Event URI
         */
        uri: string;
        /**
         * Total articles reporting about the event
         */
        totalArticleCount: number;
        /**
         * Articles per language
         */
        articlesCounts: Record<string, number>;
        /**
         * List of concepts
         */
        concepts?: Concept[];
        /**
         * List of categories
         */
        categories?: Category[];
        /**
         * Event title in available languages
         */
        title: Label;
        /**
         * Event summary in available languages
         */
        summary: Summary;
        /**
         * Which dates have been frequently found in articles about this event
         */
        commonDates: CommonDate[];
        /**
         * When the event happened
         */
        eventDate: string;
        /**
         * Sentiment of the event (can be null if value is not set). Between -1 and 1.
         */
        sentiment: number;
        /**
         * How much impact on social media did articles about the event get
         */
        socialScore: number;
        /**
         * Parameter used internally for sorting purposes. DO NOT USE THE VALUE
         */
        wgt: number;
        /**
         * Images of the event
         */
        images: string[];
        /**
         * Where did the event happen
         */
        location: EventLocation;
        /**
         * List of clusters reporting about the event
         */
        stories: any[];
    }
}
