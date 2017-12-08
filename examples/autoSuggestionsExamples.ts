import { EventRegistry } from "eventregistry";

// examples showing how to use the autosuggest functionalities for
// concepts, sources, categories, locations, ....

const er = new EventRegistry();

// get concept uris for concepts based on the concept labels
er.suggestConcepts("Obama", {lang: "eng", conceptLang: ["eng", "deu"]}).then((response) => {
    console.info(response);
});

// get only the top concept that best matches the prefix
er.getConceptUri("Obama").then((response) => {
    console.info(`A URI of the top concept that contains the term 'Obama': ${response}`);
});

// return a list of categories that contain text "Business"
er.suggestCategories("Business").then((response) => {
    console.info(response);
});

// return the top category that contains text "Business"
er.getCategoryUri("Business").then((response) => {
    console.info(`A URI of the top category that contains the term 'Business': ${response}`);
});

// get a list of locations that best match the prefix "Lond"
er.suggestLocations("Lond").then((response) => {
    console.info(response);
});

// get a top location that best matches the prefix "Lond"
er.getLocationUri("Lond").then((response) => {
    console.info(`A top location that contains text 'Lond': ${response}`);
});

// get a top location for "lond" that is located in USA
er.getLocationUri("united states", {sources: "country"}).then((response) => {
    console.info(response);
});

// suggest a list of concept classes that best match the text "auto"
er.suggestConceptClasses("auto").then((response) => {
    console.info(response);
});
