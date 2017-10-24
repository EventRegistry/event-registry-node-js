"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
var base_1 = require("./base");
var EventRegistry = /** @class */ (function () {
    function EventRegistry(config) {
        this._defaultConfig = {
            host: "http://eventregistry.org",
            logging: false,
            minDelayBetweenRequests: 0.5,
            repeatFailedRequestCount: -1,
            verboseOutput: false,
        };
        this.config = _.extend({}, this._defaultConfig, config);
        base_1.logger.info("test");
    }
    return EventRegistry;
}());
exports.EventRegistry = EventRegistry;
