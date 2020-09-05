import { FileContentWithPath } from '../../contracts/Write';
import {
  PrepComponent,
  PrepStyledComponents,
  PrepCss,
  PrepStorybook,
  PrepDescription
} from '../../contracts/PrepFile';

import { loadFile } from './loadFile';

import { MsgGeneratedFileWarning } from '../messages/messages';
import {
  ErrorPrepFileComponent,
  ErrorPrepFileStyledComponents,
  ErrorPrepFileCss,
  ErrorPrepFileStorybook,
  ErrorPrepFileDescription
} from '../errors/errors';

/**
 * Prepare component (element) to be written to file
 *
 * @param data Object with required data
 */
export const prepComponent = async (data: PrepComponent): Promise<FileContentWithPath> => {
  if (!data) throw new Error(ErrorPrepFileComponent);
  if (
    !data.name ||
    !data.filePath ||
    !data.format ||
    !data.templates ||
    !data.text ||
    !data.extraProps
  )
    throw new Error(ErrorPrepFileComponent);
  const { name, filePath, format, templates, text, extraProps } = data;

  const SUFFIX = 'Styled';
  const path = templates.templatePathReact;

  const template = await loadFile(path, true);
  template
    .replace(/{{NAME}}/gi, name)
    .replace(/{{NAME_STYLED}}/gi, `${name}${SUFFIX}`)
    .replace(/{{EXTRA_PROPS}}/gi, extraProps)
    .replace(/\s>/gi, '>')
    .replace(/{{TEXT}}/gi, text);

  return { fileContent: `${template}`, filePath: `${filePath}.${format}` };
};

/**
 * Prepare Styled Components-formatted React element to be written to file
 *
 * @param data Object with required data
 */
export const prepStyledComponents = async (
  data: PrepStyledComponents
): Promise<FileContentWithPath> => {
  if (!data) throw new Error(ErrorPrepFileStyledComponents);
  if (!data.name || !data.filePath || !data.format || !data.templates || !data.element)
    throw new Error(ErrorPrepFileStyledComponents);

  const { name, filePath, format, templates, element } = data;

  const SUFFIX = 'Styled';
  const path = templates.templatePathStyled;

  const template = await loadFile(path, true);
  template
    .replace(/{{ELEMENT}}/gi, element)
    .replace(/{{NAME_CSS}}/gi, `${name}Css`)
    .replace(/{{NAME_STYLED}}/gi, `${name}${SUFFIX}`);

  return { fileContent: `${template}`, filePath: `${filePath}${SUFFIX}.${format}` };
};

/**
 * Prepare CSS to be written to file
 *
 * @param data Object with required data
 */
export const prepCss = (data: PrepCss): FileContentWithPath => {
  if (!data) throw new Error(ErrorPrepFileCss);
  if (!data.name || !data.filePath || !data.format || !data.file) throw new Error(ErrorPrepFileCss);

  const { name, filePath, format, imports, file } = data;

  const SUFFIX = 'Css';
  const EXPORT = format === 'mjs' ? `export default ${name}${SUFFIX}` : `module.exports = ${name}`;
  const FILE_CONTENT = `// ${MsgGeneratedFileWarning}\n\n${imports}\nconst ${name}${SUFFIX} = \`${file}\`;\n\n${EXPORT};`;

  return { fileContent: FILE_CONTENT, filePath: `${filePath}${SUFFIX}.${format}` };
};

/**
 * Prepare Storybook data to be written to file
 *
 * @param data Object with required data
 */
export const prepStorybook = async (data: PrepStorybook): Promise<FileContentWithPath> => {
  if (!data) throw new Error(ErrorPrepFileStorybook);
  if (!data.name || !data.filePath || !data.format || !data.templates || !data.text)
    throw new Error(ErrorPrepFileStorybook);

  const { name, filePath, format, templates, text } = data;

  const SUFFIX = '.stories';
  const path = templates.templatePathStorybook;

  const template = await loadFile(path, true);
  template.replace(/{{NAME}}/gi, name).replace(/{{TEXT}}/gi, text);

  return { fileContent: `${template};`, filePath: `${filePath}${SUFFIX}.${format}` };
};

/**
 * Prepare Markdown description to be written to file
 *
 * @param data Object with required data
 */
export const prepDescription = (data: PrepDescription): FileContentWithPath => {
  if (!data) throw new Error(ErrorPrepFileDescription);
  if (!data.filePath || !data.file || !data.format) throw new Error(ErrorPrepFileDescription);

  const { filePath, file, format } = data;

  const FILE_CONTENT = `<!--${MsgGeneratedFileWarning}-->\n${file}`;

  return { fileContent: FILE_CONTENT, filePath: `${filePath}.description.${format}` };
};
