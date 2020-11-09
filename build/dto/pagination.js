"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pagination = void 0;
var class_validator_1 = require("class-validator");
var Pagination = /** @class */ (function () {
    function Pagination() {
        this.limit = 10;
        this.offset = 0;
    }
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsString()
    ], Pagination.prototype, "where", void 0);
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsNumber()
    ], Pagination.prototype, "limit", void 0);
    __decorate([
        class_validator_1.IsOptional(),
        class_validator_1.IsNumber()
    ], Pagination.prototype, "offset", void 0);
    return Pagination;
}());
exports.Pagination = Pagination;
