"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refresh = void 0;
const tslib_1 = require("tslib");
const trash_1 = tslib_1.__importDefault(require("trash"));
const createFolder_1 = require("./createFolder");
const errors_1 = require("../errors/errors");
async function refresh(path) {
    try {
        if (!path)
            throw new Error(errors_1.ErrorRefresh);
        await trash_1.default([`./${path}`]);
        createFolder_1.createFolder(path);
    }
    catch (error) {
        throw new Error(error);
    }
}
exports.refresh = refresh;
//# sourceMappingURL=refresh.js.map