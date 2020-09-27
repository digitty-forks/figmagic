"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseTypographyStylingFromElement = void 0;
const tslib_1 = require("tslib");
const path = tslib_1.__importStar(require("path"));
const getTokenMatch_1 = require("./getTokenMatch");
const getFileContents_1 = require("./getFileContents");
const roundColorValue_1 = require("../../../frameworks/string/roundColorValue");
const errors_1 = require("../../../frameworks/errors/errors");
function parseTypographyStylingFromElement(textElement, remSize, outputFormatTokens, letterSpacingUnit, outputFolderTokens) {
    try {
        if (!textElement || !remSize)
            throw new Error(errors_1.ErrorParseTypographyStylingFromElement);
        const PATH = process.env.IS_TEST ? path.join('testdata', 'tokens') : outputFolderTokens;
        const { colors, fontFamilies, fontSizes, fontWeights, letterSpacings, lineHeights } = getFiles(PATH, outputFormatTokens);
        let css = ``;
        const imports = [];
        const FONT_COLOR = getFontColor(textElement);
        if (FONT_COLOR) {
            const { updatedCss, updatedImports } = getTokenMatch_1.getTokenMatch(colors, 'colors', 'color', FONT_COLOR, remSize);
            css += updatedCss;
            updatedImports.forEach((i) => imports.push(i));
        }
        const FONT_SIZE = getFontSize(textElement);
        if (FONT_SIZE) {
            const { updatedCss, updatedImports } = getTokenMatch_1.getTokenMatch(fontSizes, 'fontSizes', 'font-size', FONT_SIZE, remSize);
            css += updatedCss;
            updatedImports.forEach((i) => imports.push(i));
        }
        const FONT_FAMILY = getFontFamily(textElement);
        if (FONT_FAMILY) {
            const { updatedCss, updatedImports } = getTokenMatch_1.getTokenMatch(fontFamilies, 'fontFamilies', 'font-family', FONT_FAMILY, remSize);
            css += updatedCss;
            updatedImports.forEach((i) => imports.push(i));
        }
        const FONT_WEIGHT = getFontWeight(textElement);
        if (FONT_WEIGHT) {
            const { updatedCss, updatedImports } = getTokenMatch_1.getTokenMatch(fontWeights, 'fontWeights', 'font-weight', FONT_WEIGHT, remSize);
            css += updatedCss;
            updatedImports.forEach((i) => imports.push(i));
        }
        const FONT_LINE_HEIGHT = getFontLineHeight(textElement);
        if (FONT_LINE_HEIGHT) {
            const { updatedCss, updatedImports } = getTokenMatch_1.getTokenMatch(lineHeights, 'lineHeights', 'line-height', FONT_LINE_HEIGHT, remSize);
            css += updatedCss;
            updatedImports.forEach((i) => imports.push(i));
        }
        const LETTER_SPACING = getFontLetterSpacing(textElement);
        if (LETTER_SPACING && FONT_SIZE) {
            const SIZE = LETTER_SPACING / FONT_SIZE;
            const SIZE_STRING = `${SIZE}${letterSpacingUnit}`;
            const { updatedCss, updatedImports } = getTokenMatch_1.getTokenMatch(letterSpacings, 'letterSpacings', 'letter-spacing', SIZE_STRING, remSize);
            css += updatedCss;
            updatedImports.forEach((i) => imports.push(i));
        }
        const FONT_ALIGNMENT = getFontAlignment(textElement);
        if (FONT_ALIGNMENT) {
            const ALIGNMENT = FONT_ALIGNMENT.toLowerCase();
            css += `text-align: ${ALIGNMENT};\n`;
        }
        const FONT_CASE = getFontCase(textElement);
        if (FONT_CASE)
            css += `text-transform: ${FONT_CASE};\n`;
        const NEW_CSS = reduceCssDuplicates(css);
        return { updatedCss: NEW_CSS, updatedImports: imports };
    }
    catch (error) {
        throw new Error(errors_1.ErrorParseTypographyStylingFromElement);
    }
}
exports.parseTypographyStylingFromElement = parseTypographyStylingFromElement;
const getFiles = (path, outputFormatTokens) => {
    try {
        const colors = getFileContents_1.getFileContents(path, 'colors', outputFormatTokens);
        const fontFamilies = getFileContents_1.getFileContents(path, 'fontFamilies', outputFormatTokens);
        const fontSizes = getFileContents_1.getFileContents(path, 'fontSizes', outputFormatTokens);
        const fontWeights = getFileContents_1.getFileContents(path, 'fontWeights', outputFormatTokens);
        const letterSpacings = getFileContents_1.getFileContents(path, 'letterSpacings', outputFormatTokens);
        const lineHeights = getFileContents_1.getFileContents(path, 'lineHeights', outputFormatTokens);
        return {
            colors,
            fontFamilies,
            fontSizes,
            fontWeights,
            letterSpacings,
            lineHeights
        };
    }
    catch (error) {
        throw new Error(error);
    }
};
const reduceCssDuplicates = (css) => Array.from(new Set(css.split(/;/gi)))
    .toString()
    .replace(/,/gi, ';');
const getFontColor = (textElement) => {
    if (textElement.fills) {
        if (textElement.fills[0] && textElement.fills[0].type === 'SOLID') {
            if (!textElement.fills[0].color)
                throw new Error(errors_1.ErrorGetFontColor);
            const R = roundColorValue_1.roundColorValue(textElement.fills[0].color.r);
            const G = roundColorValue_1.roundColorValue(textElement.fills[0].color.g);
            const B = roundColorValue_1.roundColorValue(textElement.fills[0].color.b);
            const A = roundColorValue_1.roundColorValue(textElement.fills[0].color.a, 1);
            return `rgba(${R}, ${G}, ${B}, ${A})`;
        }
    }
    return null;
};
const getFontSize = (textElement) => {
    if (textElement.type === 'TEXT' && textElement.style)
        return parseFloat(textElement.style.fontSize);
    return null;
};
const getFontFamily = (textElement) => {
    if (textElement.type === 'TEXT' && textElement.style)
        return textElement.style.fontPostScriptName;
    return null;
};
const getFontWeight = (textElement) => {
    if (textElement.type === 'TEXT' && textElement.style)
        return textElement.style.fontWeight;
    return null;
};
const getFontLineHeight = (textElement) => {
    if (textElement.type === 'TEXT') {
        if (textElement.style) {
            if (textElement.style.lineHeightPercentFontSize) {
                return textElement.style.lineHeightPercentFontSize / 100;
            }
            else
                return 1.0;
        }
    }
    return null;
};
const getFontAlignment = (textElement) => {
    if (textElement.type === 'TEXT' && textElement.style)
        return textElement.style.textAlignHorizontal;
    return null;
};
const getFontLetterSpacing = (textElement) => {
    if (textElement.type === 'TEXT' && textElement.style && textElement.style.letterSpacing)
        return parseFloat(textElement.style.letterSpacing);
    return null;
};
const getFontCase = (textElement) => {
    if (textElement.type === 'TEXT' && textElement.style && textElement.style.textCase) {
        if (textElement.style.textCase === 'LOWER')
            return 'lowercase';
        if (textElement.style.textCase === 'UPPER')
            return 'uppercase';
        if (textElement.style.textCase === 'TITLE')
            return 'capitalize';
    }
    return null;
};
//# sourceMappingURL=parseTypographyStylingFromElement.js.map