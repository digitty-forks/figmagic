import { FigmaData } from '../contracts/FigmaData';
import { Config } from '../contracts/Config';

import { createPage } from './interactors/common/createPage';
import { processElements } from './interactors/elements/processElements';
import { writeElements } from './interactors/elements/writeElements';
import { processGraphicElementsMap } from './interactors/elements/processGraphicElementsMap';
import { writeGraphicElementsMap } from './interactors/elements/writeGraphicElementsMap';

import { refresh } from '../frameworks/filesystem/refresh';

import { MsgSyncElements } from '../frameworks/messages/messages';
import { ErrorCreateElements } from '../frameworks/errors/errors';
import { FigmagicElement } from '../contracts/FigmagicElement';

/**
 * @description Use case for syncing (creating) React elements from Figma files
 */
export async function createElements(config: Config, data: FigmaData): Promise<void> {
  try {
    if (!config || !data) throw new Error(ErrorCreateElements);
    console.log(MsgSyncElements);
  } catch (error) {
    throw new Error(error);
  }

  try {
    await refresh(config.outputFolderElements);
    const { components }: any = data;
    handleElements({
      children: data.document.children,
      pageName: 'Elements',
      config,
      components
    } as Element);

    /**
     * Handle a bit of a special corner case: SVG graphics packed into React components.
     */
    if (
      config.outputGraphicElements &&
      config.outputFormatGraphics === 'svg' &&
      config.syncGraphics
    ) {
      const GRAPHICS = handleElements({
        children: data.document.children,
        pageName: 'Graphics',
        config,
        components,
        isGeneratingGraphics: true
      });

      /**
       * The user can also further choose to create an object that exports all graphical React components.
       */
      if (config.outputGraphicElementsMap) {
        handleGraphicElementsMap({ config, graphics: GRAPHICS } as GraphicElementsMap);
      }
    }
  } catch (error) {
    throw new Error(error);
  }
}

function handleElements(element: Element): FigmagicElement[] {
  const { children, pageName, config, components, isGeneratingGraphics } = element;

  const PAGE = createPage(children, pageName);
  const ELEMENTS = processElements(PAGE, config, components);
  writeElements(ELEMENTS, config, isGeneratingGraphics);

  return ELEMENTS;
}

function handleGraphicElementsMap(graphicElementsMap: GraphicElementsMap) {
  const { config, graphics } = graphicElementsMap;

  const FOLDER = `${config.outputFolderElements}/Graphics`;
  const FILE_PATH = `${FOLDER}/index.${config.outputFormatElements}`;
  const FILE_CONTENT = processGraphicElementsMap(graphics);

  writeGraphicElementsMap(FOLDER, FILE_PATH, FILE_CONTENT);
}

type Element = {
  children: any[];
  pageName: any;
  config: any;
  components: any;
  isGeneratingGraphics?: boolean;
};

type GraphicElementsMap = {
  config: any;
  graphics: any;
};
