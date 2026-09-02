import { pathToFileURL } from "node:url";
import { EventRegistry } from "eventregistry";

// examples showing how to use the autosuggest functionalities for
// concepts, sources, categories, locations, ....

const er = new EventRegistry();

async function main(): Promise<void> {
    console.info(await er.suggestConcepts("Obama", {lang: "eng", conceptLang: ["eng", "deu"]}));
    console.info(`A URI of the top concept that contains the term 'Obama': ${await er.getConceptUri("Obama")}`);
    console.info(await er.suggestCategories("Business"));
    console.info(`A URI of the top category that contains the term 'Business': ${await er.getCategoryUri("Business")}`);
    console.info(await er.suggestLocations("Lond"));
    console.info(`A top location that contains text 'Lond': ${await er.getLocationUri("Lond")}`);
    console.info(await er.getLocationUri("united states", {sources: "country"}));
    console.info(await er.suggestConceptClasses("auto"));
}

const invokedDirectly = process.argv[1] !== undefined
    && import.meta.url === pathToFileURL(process.argv[1]).href;

if (invokedDirectly) {
    void main().catch((error: unknown) => {
        console.error(error);
        process.exitCode = 1;
    });
}
