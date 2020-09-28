"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeFontTokens = void 0;
const camelize_1 = require("../../../frameworks/string/camelize");
const errors_1 = require("../../../frameworks/errors/errors");
function makeFontTokens(fontFrame, usePostscriptFontNames = true) {
    if (!fontFrame)
        throw new Error(errors_1.ErrorMakeFontTokensNoFrame);
    if (!fontFrame.children)
        throw new Error(errors_1.ErrorMakeFontTokensNoChildren);
    const fonts = {};
    const TOKENS = fontFrame.children;
    TOKENS.forEach((item) => {
        if (!item.name || !item.style)
            throw new Error(errors_1.ErrorMakeFontTokensMissingProps);
        const NAME = camelize_1.camelize(item.name);
        fonts[NAME] = usePostscriptFontNames
            ? item.style.fontPostScriptName
            : item.style.fontFamily.replace(' /g', '');
    });
    return fonts;
}
exports.makeFontTokens = makeFontTokens;
//# sourceMappingURL=makeFontTokens.js.map