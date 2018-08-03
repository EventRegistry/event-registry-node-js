import { TopicPage, EventRegistry, ArticleInfoFlags, ReturnInfo } from "eventregistry";

const er = new EventRegistry();

/**
 * create a topic page directly
 */
async function createTopicPage1() {
    const topic = new TopicPage(er);
    topic.addKeyword("renewable energy", 30);
    topic.addConcept(await er.getConceptUri("biofuel"), 50);
    topic.addConcept(await er.getConceptUri("solar energy"), 50);
    topic.addConcept(await er.getCategoryUri("renewable"), 50);
    // skip articles that are duplicates of other articles
    topic.articleHasDuplicateFilter = "skipHasDuplicates";
    topic.articleHasEventFilter = "skipArticlesWithoutEvent";
    // get first 2 pages of articles sorted by relevance to the topic page
    const articles1 = await topic.getArticles({page: 1, sortBy: "rel"});
    const articles2 = await topic.getArticles({page: 2, sortBy: "rel"});
    // get first page of events
    const events1 = await topic.getEvents({page: 1, sortBy: "rel"});
}

/**
 *  create a topic page directly, set the article threshold, restrict results to set concepts and keywords
 */
async function createTopicPage2() {
    const topic = new TopicPage(er);
    topic.addConcept(await er.getCategoryUri("renewable"), 50);

    topic.addKeyword("renewable energy", 30);
    topic.addConcept(await er.getConceptUri("biofuel"), 50);
    topic.addConcept(await er.getConceptUri("solar energy"), 50);

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
    const articles = await topic.getArticles({page: 1, sortBy: "date", returnInfo: returnInfo});
    for (const article of articles) {
        console.log(article);
    }
}

async function loadERTopicPage() {
    let articles;
    try {
        const topic = new TopicPage(er);
        await topic.loadTopicPageFromER("265e373d-ebf6-487f-a346-f87c198ec8dd");
        articles = await topic.getArticles({page: 1, sortBy: "date"});
    } catch (error) {
        console.error(error);
    } finally {
        return articles;
    }
}

async function saveAndLoadTopicPage() {
    const topic = new TopicPage(er);
    topic.addKeyword("renewable energy", 30);
    const articles1 = await topic.getArticles({page: 1});
    // get the definition of the topic page as an object
    // you can save this and later load it
    const definition = topic.saveTopicPageDefinition();
    const topic2 = new TopicPage(er);
    topic2.loadTopicPageFromDefinition(definition);
    const articles2 = await topic2.getArticles({page: 1});
    // articles1 and articles2 should be (almost) the same
}

async function saveAndLoadTopicPageFromFile() {
    const topic = new TopicPage(er);
    topic.addKeyword("renewable energy", 30);
    const articles1 = await topic.getArticles({page: 1});
    // save the definition to a file and later load it
    const definition = topic.saveTopicPageDefinitionToFile("topic.json");
    const topic2 = new TopicPage(er);
    topic2.loadTopicPageFromFile("topic.json");
    const articles2 = await topic2.getArticles({page: 1});
    // articles1 and articles2 should be (almost) the same
}

createTopicPage1();
createTopicPage2();
loadERTopicPage();
saveAndLoadTopicPage();
saveAndLoadTopicPageFromFile();
