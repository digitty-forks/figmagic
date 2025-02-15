import { FRAME as Frame } from './Figma';

import {
  LetterSpacingUnit,
  OutputFormatColors,
  OutputFormatTokens,
} from './Config';

export type TypographyElement = {
  letterSpacingUnit: LetterSpacingUnit;
  outputFolderTokens: string;
  outputFormatTokens: OutputFormatTokens;
  outputFormatColors: OutputFormatColors;
  remSize: number;
  textElement: Frame;
  usePostscriptFontNames: boolean;
};
