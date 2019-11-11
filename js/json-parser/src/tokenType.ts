export interface TokenType {
  type: TOKEN_TYPE;
  value: string | null;
}

export enum TOKEN_TYPE {
  OpenBrace = '{',
  CloseBrace = '}',
  OpenBracket = '[',
  CloseBracket = ']',
  String = 'String',
  Number = 'Number',
  Colon = ':',
  Comma = ',',
  BitOr = '|',
  Quote = '"',
  SingleSlash = '/',
  Comment = 'Comment',
  Identifier = 'Identifier',
  True = 'true',
  False = 'false',
  Null = 'null',
}

export const KEY_TOKENS = [TOKEN_TYPE.True, TOKEN_TYPE.False, TOKEN_TYPE.Null];

const WHITE_SPACE_REG = /\s/;
const LETTER_REG = /\w/;
const NEW_LINE_REG = /\r?\n/;
const NUMBER_REG = /\d/;

export function isWhiteSpace(char: string) {
  return WHITE_SPACE_REG.test(char);
}

export function isLetter(char: string) {
  return LETTER_REG.test(char);
}

export function isNewLine(char: string) {
  return NEW_LINE_REG.test(char);
}

export function isNumber(char: string) {
  return NUMBER_REG.test(char);
}
