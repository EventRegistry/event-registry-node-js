import { EventRegistry } from "../eventRegistry";
import { RequestMentionsInfo } from "../queryMentions";
import { ER } from "../types";
import { iterateMentions, searchMentions } from "../helpers/mentions";

export class MentionsFluent {
    constructor(private readonly er: EventRegistry) {}

    search(args: Omit<ER.QueryMentions.Arguments, "requestedResult"> = {}): MentionsSearchBuilder {
        return new MentionsSearchBuilder(this.er, args);
    }

    iterate(args: ER.QueryMentions.IteratorArguments = {}): AsyncIterable<Record<string, unknown>> {
        return iterateMentions(this.er, args);
    }
}

class MentionsSearchBuilder {
    private infoOpts: ConstructorParameters<typeof RequestMentionsInfo>[0] = {};

    constructor(
        private readonly er: EventRegistry,
        private readonly args: Omit<ER.QueryMentions.Arguments, "requestedResult">
    ) {}

    info(opts: ConstructorParameters<typeof RequestMentionsInfo>[0] = {}): this {
        this.infoOpts = opts ?? {};
        return this;
    }

    exec(): Promise<ER.Response> {
        return searchMentions(this.er, { ...this.args, ...this.infoOpts });
    }
}
