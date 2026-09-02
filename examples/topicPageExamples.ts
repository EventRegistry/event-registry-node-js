import { pathToFileURL } from "node:url";
import { TopicPage, EventRegistry, ArticleInfoFlags, ReturnInfo } from "eventregistry";

const er = new EventRegistry();
type TopicArticlesResponse = {articles?: {results?: unknown[]}};

async function requiredUri(uri: Promise<string | undefined>): Promise<string> {
    const resolvedUri = await uri;
    if (resolvedUri === undefined) {
        throw new Error("No Event Registry URI matched the supplied label.");
    }
    return resolvedUri;
}

/**
 * create a topic page directly
 */
async function createTopicPage1() {
    const topic = new TopicPage(er);
    topic.addKeyword("renewable energy", 30);
    topic.addConcept(await requiredUri(er.getConceptUri("biofuel")), 50);
    topic.addConcept(await requiredUri(er.getConceptUri("solar energy")), 50);
    topic.addCategory(await requiredUri(er.getCategoryUri("renewable")), 50);
    // skip articles that are duplicates of other articles
    topic.articleIsDuplicateFilter = "skipDuplicates";
    topic.articleHasEventFilter = "skipArticlesWithoutEvent";
    // get first 2 pages of articles sorted by relevance to the topic page
    const responseArticles1 = await topic.getArticles({page: 1, sortBy: "rel"});
    const responseArticles2 = await topic.getArticles({page: 2, sortBy: "rel"});
    // get first page of events
    const responseEvents1 = await topic.getEvents({page: 1, sortBy: "rel"});
    console.info(responseArticles1);
    console.info(responseArticles2);
    console.info(responseEvents1);
}

/**
 *  create a topic page directly, set the article threshold, restrict results to set concepts and keywords
 */
async function createTopicPage2() {
    const topic = new TopicPage(er);
    topic.addCategory(await requiredUri(er.getCategoryUri("renewable")), 50);

    topic.addKeyword("renewable energy", 30);
    topic.addConcept(await requiredUri(er.getConceptUri("biofuel")), 50);
    topic.addConcept(await requiredUri(er.getConceptUri("solar energy")), 50);

    // require that the results will mention at least one of the concepts and keywords specified
    // (even though they might have the category about renewable energy, that will not be enough
    // for an article to be among the results)
    topic.restrictToSetConceptsAndKeywords = true;
    // limit results to English, German and Spanish results
    topic.languages = ["eng", "deu", "spa"];
    // get results that are at most 3 days old
    topic.maxDaysBack = 3;
    // require that the articles that will be returned should get at least a total score of 30 points or more
    // based on the specified list of conditions
    topic.articleThreshold = 30;
    const articleInfo = new ArticleInfoFlags ({concepts: true, categories: true});
    const returnInfo = new ReturnInfo({articleInfo: articleInfo});
    // get first page of articles sorted by date (from most recent backward) to the topic page
    const response = await topic.getArticles({ page: 1, sortBy: "date", returnInfo: returnInfo }) as TopicArticlesResponse;
    const articles = response?.articles?.results ?? [];
    for (const article of articles) {
        console.log(article);
    }
}

async function loadERTopicPage() {
    let articles: unknown[] = [];
    try {
        const topic = new TopicPage(er);
        await topic.loadTopicPageFromER("265e373d-ebf6-487f-a346-f87c198ec8dd");
        const response = await topic.getArticles({page: 1, sortBy: "date"}) as TopicArticlesResponse;
        articles = response?.articles?.results ?? [];
    } catch (error) {
        console.error(error);
    } finally {
        return articles;
    }
}

async function saveAndLoadTopicPage() {
    const topic = new TopicPage(er);
    topic.addKeyword("renewable energy", 30);
    const response1 = await topic.getArticles({page: 1});
    // get the definition of the topic page as an object
    // you can save this and later load it
    const definition = topic.saveTopicPageDefinition();
    const topic2 = new TopicPage(er);
    topic2.loadTopicPageFromDefinition(definition);
    const response2 = await topic2.getArticles({page: 1});
    console.info(response1);
    console.info(response2);
}

async function saveAndLoadTopicPageFromFile() {
    const topic = new TopicPage(er);
    topic.addKeyword("renewable energy", 30);
    const response1 = await topic.getArticles({page: 1});
    // save the definition to a file and later load it
    topic.saveTopicPageDefinitionToFile("topic.json");
    const topic2 = new TopicPage(er);
    topic2.loadTopicPageFromFile("topic.json");
    const response2 = await topic2.getArticles({page: 1});
    console.info(response1);
    console.info(response2);
}

async function main(): Promise<void> {
    await createTopicPage1();
    await createTopicPage2();
    console.info(await loadERTopicPage());
    await saveAndLoadTopicPage();
    await saveAndLoadTopicPageFromFile();
}

const invokedDirectly = process.argv[1] !== undefined
    && import.meta.url === pathToFileURL(process.argv[1]).href;

if (invokedDirectly) {
    void main().catch((error: unknown) => {
        console.error(error);
        process.exitCode = 1;
    });
}
