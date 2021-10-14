import {
    EventRegistry,
    QueryMentions,
    RequestMentionsUriWgtList,
} from "eventregistry";

// examples of how to search for events using different search criteria

const er = new EventRegistry({allowUseOfArchive: false});

const q1 = new QueryMentions({eventTypeUri: "et/business/acquisitions-mergers"});
q1.setRequestedResult(new RequestMentionsUriWgtList());
er.execQuery(q1).then((response) => {
    console.log(response);
})

const q2 = new QueryMentions({eventTypeUri: "et/business/labor-issues"});
er.execQuery(q2).then((response) => {
    console.log(response);
})