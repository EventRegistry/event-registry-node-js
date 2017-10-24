export interface IConfig {
    apiKey?: string;
    host?: string;
    logging?: boolean;
    minDelayBetweenRequests?: number;
    repeatFailedRequestCount?: number;
    verboseOutput?: boolean;
}
export declare class EventRegistry {
    protected config: IConfig;
    private _defaultConfig;
    constructor(config: IConfig);
}
