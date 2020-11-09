"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
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
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchBase = void 0;
var common_1 = require("@nestjs/common");
var SearchBase = /** @class */ (function () {
    function SearchBase(esService) {
        this.esService = esService;
    }
    SearchBase.prototype.buildGettingParams = function (args) {
        var searchFields = args.search || [];
        var params = searchFields.length ? Object.assign.apply(Object, __spreadArrays([{}], searchFields.map(function (field) {
            var _a;
            return (_a = {}, _a[field.fieldName] = field.keyword, _a);
        }))) : {};
        return params;
    };
    SearchBase.prototype.buildTextGettingParams = function (args) {
        var searchFields = args.search || [];
        var params = searchFields.length ? Object.assign.apply(Object, __spreadArrays([{}], searchFields.map(function (field) {
            var _a;
            return (_a = {},
                _a[field.fieldName] = {
                    value: '*' + field.keyword + '*',
                    boost: 1.0,
                    rewrite: "constant_score"
                },
                _a);
        }))) : {};
        return params;
    };
    SearchBase.prototype.pushDocs = function (docs, docsIndexName) {
        return __awaiter(this, void 0, void 0, function () {
            var body;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.parseAndPrepareData(docs, docsIndexName)];
                    case 1:
                        body = _a.sent();
                        this.esService.bulk({
                            index: docsIndexName,
                            body: body,
                        }, function (err) {
                            if (err) {
                                throw new common_1.BadRequestException(err.message);
                            }
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    SearchBase.prototype.pushData = function (doc, docsIndexName) {
        return __awaiter(this, void 0, void 0, function () {
            var body;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.parseAndPrepareData([doc], docsIndexName)];
                    case 1:
                        body = _a.sent();
                        this.esService.bulk({
                            index: docsIndexName,
                            body: body,
                        }, function (err) {
                            if (err) {
                                throw new common_1.BadRequestException(err.message);
                            }
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    SearchBase.prototype.searchByIds = function (args, docsIndexName, ids) {
        return __awaiter(this, void 0, void 0, function () {
            var results, condition, body, hits;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        results = [];
                        condition = {
                            match: {
                                ids: {
                                    values: ids
                                }
                            }
                        };
                        return [4 /*yield*/, this.esService.search({
                                index: docsIndexName,
                                body: {
                                    size: args.limit,
                                    from: args.offset,
                                    query: condition
                                },
                            })];
                    case 1:
                        body = (_a.sent()).body;
                        hits = body.hits.hits;
                        hits.map(function (item) {
                            results.push(item._source);
                        });
                        return [2 /*return*/, args.limit === 1 ? { results: results, total: body.hits.total.value, data: results[0] } : { results: results, total: body.hits.total.value }];
                }
            });
        });
    };
    SearchBase.prototype.searchAll = function (args, docsIndexName, where) {
        return __awaiter(this, void 0, void 0, function () {
            var results, condition, query, sort, body, hits;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        results = [];
                        condition = where ? where : this.buildGettingParams(args);
                        query = where || args.search ? { match: condition } : {
                            match_all: {}
                        };
                        sort = args.sort ? [
                            (_a = {},
                                _a[args.sort.sortBy] = {
                                    'order': args.sort.sortType
                                },
                                _a)
                        ] : [];
                        return [4 /*yield*/, this.esService.search({
                                index: docsIndexName,
                                body: {
                                    size: args.pagination.limit,
                                    from: args.pagination.offset,
                                    query: query,
                                    sort: sort
                                },
                            })];
                    case 1:
                        body = (_b.sent()).body;
                        hits = body.hits.hits;
                        hits.map(function (item) {
                            results.push(item._source);
                        });
                        return [2 /*return*/, { results: results, total: body.hits.total.value }];
                }
            });
        });
    };
    SearchBase.prototype.searchTextAll = function (args, docsIndexName, where) {
        return __awaiter(this, void 0, void 0, function () {
            var results, condition, query, sort, body, hits;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        results = [];
                        condition = where ? where : this.buildTextGettingParams(args);
                        query = where || args.search ? { wildcard: condition } : {
                            match_all: {}
                        };
                        sort = args.sort ? [
                            (_a = {},
                                _a[args.sort.sortBy] = {
                                    'order': args.sort.sortType
                                },
                                _a)
                        ] : [];
                        return [4 /*yield*/, this.esService.search({
                                index: docsIndexName,
                                body: {
                                    size: args.pagination.limit,
                                    from: args.pagination.offset,
                                    query: query,
                                    sort: sort
                                },
                            })];
                    case 1:
                        body = (_b.sent()).body;
                        hits = body.hits.hits;
                        hits.map(function (item) {
                            results.push(item._source);
                        });
                        return [2 /*return*/, { results: results, total: body.hits.total.value }];
                }
            });
        });
    };
    SearchBase.prototype.updateByQuery = function (where, docsIndexName, updateData, nestedPrefix) {
        return __awaiter(this, void 0, void 0, function () {
            var script;
            return __generator(this, function (_a) {
                script = Object.entries(updateData).reduce(function (result, _a) {
                    var key = _a[0], value = _a[1];
                    return result + " ctx._source." + (nestedPrefix ? nestedPrefix + '.' + key : key) + "='" + value + "';";
                }, '');
                return [2 /*return*/, this.esService.updateByQuery({
                        index: docsIndexName,
                        refresh: true,
                        body: {
                            query: {
                                match: where
                            },
                            script: {
                                inline: script
                            }
                        }
                    })];
            });
        });
    };
    SearchBase.prototype.remove = function (where, docsIndexName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.esService.deleteByQuery({
                    index: docsIndexName,
                    body: {
                        query: {
                            match: where
                        }
                    }
                });
                return [2 /*return*/];
            });
        });
    };
    SearchBase.prototype.parseAndPrepareData = function (docs, docsIndexName) {
        return __awaiter(this, void 0, void 0, function () {
            var body;
            return __generator(this, function (_a) {
                body = [];
                docs.map(function (item) {
                    body.push({
                        index: {
                            _index: docsIndexName,
                            _id: item.id
                        }
                    }, item);
                });
                return [2 /*return*/, body];
            });
        });
    };
    return SearchBase;
}());
exports.SearchBase = SearchBase;
