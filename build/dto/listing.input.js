"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaginationInput = exports.SortType = void 0;
var graphql_1 = require("@nestjs/graphql");
var SortType;
(function (SortType) {
    SortType["asc"] = "asc";
    SortType["desc"] = "desc";
})(SortType = exports.SortType || (exports.SortType = {}));
graphql_1.registerEnumType(SortType, { name: 'SortType' });
var PaginationInput = /** @class */ (function () {
    function PaginationInput() {
    }
    __decorate([
        graphql_1.Field(function (type) { return graphql_1.Int; })
    ], PaginationInput.prototype, "limit", void 0);
    __decorate([
        graphql_1.Field(function (type) { return graphql_1.Int; })
    ], PaginationInput.prototype, "offset", void 0);
    PaginationInput = __decorate([
        graphql_1.InputType()
    ], PaginationInput);
    return PaginationInput;
}());
exports.PaginationInput = PaginationInput;
