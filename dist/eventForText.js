"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
var base_1 = require("./base");
/**
 * The GetEventForText class can be used to find the event(s) that best matches the given input text.
 * The request is performed asynchronously.
 *
 * Note: The functionality can only be used to find the events in the last 5 days. Older events cannot
 * be matched in this way
 *
 * Return info from the compute() method is in the form:
 *
 * [
 *     {
 *         "cosSim": 0.07660648086468567,
 *         "eventUri": "4969",
 *         "storyUri": "eng-af6ce79f-cb91-4010-8ddf-7ad924bc5638-40591"
 *     },
 *     {
 *         "cosSim": 0.05851939237670918,
 *         "eventUri": "5157",
 *         "storyUri": "eng-af6ce79f-cb91-4010-8ddf-7ad924bc5638-56286"
 *     },
 *     ...
 * ]
 *
 * Where
 * - cosSim represents the cosine similarity of the document to the cluster
 * - eventUri is the uri of the corresponding event in the Event Registry
 * - storyUri is the uri of the story in the Event Registry
 *
 * You can use QueryEvent or QueryStory to obtain more information about these events/stories
 *
 */
var GetEventForText = /** @class */ (function (_super) {
    __extends(GetEventForText, _super);
    /**
     * @param er instance of EventRegistry class
     * @param nrOfEventsToReturn number of events to return for the given text
     */
    function GetEventForText(er, nrOfEventsToReturn) {
        if (nrOfEventsToReturn === void 0) { nrOfEventsToReturn = 5; }
        var _this = _super.call(this) || this;
        _this.er = er;
        _this.nrOfEventsToReturn = nrOfEventsToReturn;
        return _this;
    }
    /**
     * Compute the list of most similar events for the given text
     * @param text text for which to find the most similar event
     * @param lang language in which the text is written
     */
    GetEventForText.prototype.compute = function (text, lang) {
        if (lang === void 0) { lang = "eng"; }
        return __awaiter(this, void 0, void 0, function () {
            var params, response, requestId, _i, _a, i, res;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        params = { lang: lang, text: text, topClustersCount: this.nrOfEventsToReturn };
                        return [4 /*yield*/, this.er.jsonRequest("/json/getEventForText/enqueueRequest", params)];
                    case 1:
                        response = _b.sent();
                        requestId = _.get(response, "requestId");
                        _i = 0, _a = _.range(10);
                        _b.label = 2;
                    case 2:
                        if (!(_i < _a.length)) return [3 /*break*/, 6];
                        i = _a[_i];
                        return [4 /*yield*/, base_1.sleep(1000)];
                    case 3:
                        _b.sent();
                        return [4 /*yield*/, this.er.jsonRequest("/json/getEventForText/testRequest", { requestId: requestId })];
                    case 4:
                        res = _b.sent();
                        if (_.isArray(res) && !_.isEmpty(res)) {
                            return [2 /*return*/, res];
                        }
                        _b.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 2];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    return GetEventForText;
}(base_1.QueryParamsBase));
exports.GetEventForText = GetEventForText;
