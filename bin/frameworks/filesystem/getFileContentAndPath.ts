import type {
  PrepComponent,
  PrepCss,
  PrepDescription,
  PrepGraphicComponent,
  PrepStorybook,
  PrepStyledComponents,
} from '../../contracts/PrepFile';
import type { ProcessedToken } from '../../contracts/ProcessedToken';
import type {
  FileContentWithPath,
  GetFileDataOperation,
} from '../../contracts/Write';

import {
  prepComponent,
  prepCss,
  prepDescription,
  prepGraphicComponent,
  prepStorybook,
  prepStyledComponents,
} from './prepFile';

import { createEnumStringOutOfObject } from '../../frameworks/string/createEnumStringOutOfObject';

import {
  ErrorGetFileContentAndPath,
  ErrorGetFileContentAndPathMissingFields,
  ErrorGetFileContentAndPathNoReturn,
} from '../errors/errors';
import { MsgGeneratedFileWarning } from '../messages/messages';

/**
 * Orchestrator to get file content and path, before writing files
 */
export function getFileContentAndPath(
  getFileContentAndPathOperation: GetFileDataOperation,
): FileContentWithPath {
  if (!getFileContentAndPathOperation) throw Error(ErrorGetFileContentAndPath);
  if (!checkIfFieldsExist(getFileContentAndPathOperation))
    throw Error(ErrorGetFileContentAndPathMissingFields);

  const {
    type,
    file,
    path,
    name,
    format,
    text,
    element,
    imports,
    extraProps,
    metadata,
    templates,
  } = getFileContentAndPathOperation;

  let filePath = `${path}/${format === 'scss' ? '_' : ''}${name}`;

  const fileOperations = {
    raw: () => {
      return { fileContent: `${JSON.stringify(file, null, ' ')}`, filePath };
    },
    token: () => {
      if (metadata?.dataType === 'enum')
        return {
          fileContent: getTokenString(file, name, format, metadata.dataType),
          filePath,
        };
      filePath += `.${format}`;
      return { fileContent: getTokenString(file, name, format), filePath };
    },
    component: () => {
      if (type === 'component' && templates)
        return prepComponent({
          name,
          filePath,
          format,
          templates,
          text,
          extraProps,
          element,
        } as PrepComponent);
    },
    styled: () => {
      if (type === 'styled' && templates)
        return prepStyledComponents({
          name,
          filePath,
          format,
          templates,
          element,
        } as PrepStyledComponents);
    },
    story: () => {
      if (type === 'story' && templates)
        return prepStorybook({
          name,
          filePath,
          format,
          templates,
          text,
        } as PrepStorybook);
    },
    css: () => prepCss({ name, filePath, format, imports, file } as PrepCss),
    description: () =>
      prepDescription({ filePath, file, format } as PrepDescription),
    graphic: () =>
      prepGraphicComponent({
        name,
        filePath,
        format,
        templates,
        file,
      } as PrepGraphicComponent),
  };

  // @ts-ignore
  if (fileOperations.hasOwnProperty(type)) return fileOperations[type]();
  else throw Error(ErrorGetFileContentAndPathNoReturn);
}

/**
 * @description Get file data string for tokens
 */
const getTokenString = (
  file: string | ProcessedToken,
  name: string,
  format: string,
  dataType?: string,
): string => {
  const exportString =
    format === 'js' ? `module.exports = ${name}` : `export default ${name}`;
  const constAssertion = format === 'ts' ? ' as const;' : '';

  if (format === 'json') return getTokenStringJSON(file);
  if (format === 'css') return getTokenStringCSS(file, name);
  if (format === 'scss') return getTokenStringSCSS(file);
  if (dataType === 'enum') return getTokenStringEnum(file, name, exportString);
  return getTokenStringJS(file, name, exportString, constAssertion);
};

/**
 * @description Return JSON token string
 */
function getTokenStringJSON(file: string | ProcessedToken) {
  return `${JSON.stringify(file, null, ' ')}`;
}

/**
 * @description Return CSS variables token string
 */
function getTokenStringCSS(file: string | ProcessedToken, name: string) {
  const contents: any = file;
  let css = ':root {\n';

  for (const key in contents) {
    const value = contents[key];
    css += `  --${name}-${key}: ${value};\n`;
  }

  css += '}\n';

  return css;
}

/**
 * @description Return SCSS variables token string
 */
function getTokenStringSCSS(file: string | ProcessedToken) {
  const contents: any = file;
  let scss = `// ${MsgGeneratedFileWarning}\n\n`;

  for (const key in contents) {
    const value = contents[key];
    scss += `$${key}: ${value};\n`;
  }

  return scss;
}

/**
 * @description Return enum token string
 */
function getTokenStringEnum(
  file: string | ProcessedToken,
  name: string,
  exportString: string,
) {
  return `// ${MsgGeneratedFileWarning}\n\nenum ${name} {${createEnumStringOutOfObject(
    file,
  )}\n}\n\n${exportString};`;
}

/**
 * @description Return TS/JS token string
 */
function getTokenStringJS(
  file: string | ProcessedToken,
  name: string,
  exportString: string,
  constAssertion: string,
) {
  return `// ${MsgGeneratedFileWarning}\n\nconst ${name} = ${JSON.stringify(
    file,
    null,
    ' ',
  )}${constAssertion}\n\n${exportString};`;
}

/**
 * @description Validate whether required fields exist on GetFileDataOperation type
 */
const checkIfFieldsExist = (
  getFileContentAndPathOperation: GetFileDataOperation,
): boolean => {
  if (
    !getFileContentAndPathOperation.type ||
    !getFileContentAndPathOperation.file ||
    !getFileContentAndPathOperation.path ||
    !getFileContentAndPathOperation.name ||
    !getFileContentAndPathOperation.format ||
    !getFileContentAndPathOperation.element
  )
    return false;
  return true;
};
