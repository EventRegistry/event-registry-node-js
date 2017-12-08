import { EventRegistry, GetCounts, GetTopCorrelations, QueryArticles } from "eventregistry";

const er = new EventRegistry();

const corr = new GetTopCorrelations(er);

// First example. Concepts and categories that correlate the most with Obama
// First we need to fetch the concept URI for 'Obama'
er.getConceptUri("Obama").then((conceptUri) => {
    const counts = new GetCounts(conceptUri);
    corr.loadInputDataWithCounts(counts);
    const candidateConceptsQuery = new QueryArticles({conceptUri});

    const conceptInfo1 = corr.getTopConceptCorrelations({
        candidateConceptsQuery: candidateConceptsQuery,
        conceptType: ["person", "org", "loc"],
        exactCount: 10,
        approxCount: 100,
    });

    const categoryInfo1 = corr.getTopCategoryCorrelations({
        exactCount: 10,
        approxCount: 100,
    });
});

// Second example. Concepts and categories that correlate with keywords "iphone"
const query = new QueryArticles({keywords: "iphone"});
corr.loadInputDataWithQuery(query);

const conceptInfo2 = corr.getTopConceptCorrelations({
    exactCount: 10,
    approxCount: 100,
});

const categoryInfo2 = corr.getTopCategoryCorrelations({
    exactCount: 10,
    approxCount: 100,
});
