import { Lexer } from '../dist';
import { TOKEN_TYPE } from '../dist/tokenType';

test('parse simple', () => {
  const input = `{
    "resource": "song|arrString", // comment after |string,
    "ab": true,
    // comment line
    "num": 123
  }`;

  let lexer = new Lexer(input);
  let token = lexer.next();
  expect(token.type).toBe(TOKEN_TYPE.OpenBrace);

  token = lexer.next();
  expect(token.type).toBe(TOKEN_TYPE.String);
  expect(token.value).toBe('resource');

  token = lexer.next();
  expect(token.type).toBe(TOKEN_TYPE.Colon);

  token = lexer.next();
  expect(token.type).toBe(TOKEN_TYPE.String);
  expect(token.value).toBe('song');

  token = lexer.next();
  expect(token.type).toBe(TOKEN_TYPE.BitOr);

  token = lexer.next();
  expect(token.type).toBe(TOKEN_TYPE.String);
  expect(token.value).toBe('arrString');

  token = lexer.next();
  expect(token.type).toBe(TOKEN_TYPE.Comma);

  token = lexer.next();
  expect(token.type).toBe(TOKEN_TYPE.Comment);
  expect(token.value).toBe('comment after |string,');

  token = lexer.next();
  expect(token.type).toBe(TOKEN_TYPE.String);
  expect(token.value).toBe('ab');

  token = lexer.next();
  expect(token.type).toBe(TOKEN_TYPE.Colon);

  token = lexer.next();
  expect(token.type).toBe(TOKEN_TYPE.Identifier);
  expect(token.value).toBe(true);

  token = lexer.next();
  expect(token.type).toBe(TOKEN_TYPE.Comma);

  token = lexer.next();
  expect(token.type).toBe(TOKEN_TYPE.Comment);
  expect(token.value).toBe('comment line');

  token = lexer.next();
  expect(token.type).toBe(TOKEN_TYPE.String);
  expect(token.value).toBe('num');

  token = lexer.next();
  expect(token.type).toBe(TOKEN_TYPE.Colon);

  token = lexer.next();
  expect(token.type).toBe(TOKEN_TYPE.Number);
  expect(token.value).toBe(123);

  token = lexer.next();
  expect(token.type).toBe(TOKEN_TYPE.CloseBrace);

  lexer.next(); // null
});

test('parse object and array', () => {
  const input = `{
    "cc": [1, "asr4", { "objInArr": false }],
    "obj": {
      "un": null
    }
  }`;

  let lexer = new Lexer(input);
  let token = lexer.next();
  expect(token.type).toBe(TOKEN_TYPE.OpenBrace);

  token = lexer.next();
  expect(token.type).toBe(TOKEN_TYPE.String);
  expect(token.value).toBe('cc');

  token = lexer.next();
  expect(token.type).toBe(TOKEN_TYPE.Colon);

  token = lexer.next();
  expect(token.type).toBe(TOKEN_TYPE.OpenBracket);

  token = lexer.next();
  expect(token.type).toBe(TOKEN_TYPE.Number);
  expect(token.value).toBe(1);

  token = lexer.next();
  expect(token.type).toBe(TOKEN_TYPE.Comma);

  token = lexer.next();
  expect(token.type).toBe(TOKEN_TYPE.String);
  expect(token.value).toBe('asr4');

  token = lexer.next();
  expect(token.type).toBe(TOKEN_TYPE.Comma);

  token = lexer.next();
  expect(token.type).toBe(TOKEN_TYPE.OpenBrace);

  token = lexer.next();
  expect(token.type).toBe(TOKEN_TYPE.String);
  expect(token.value).toBe('objInArr');

  token = lexer.next();
  expect(token.type).toBe(TOKEN_TYPE.Colon);

  token = lexer.next();
  expect(token.type).toBe(TOKEN_TYPE.Identifier);
  expect(token.value).toBe(false);

  token = lexer.next();
  expect(token.type).toBe(TOKEN_TYPE.CloseBrace);

  token = lexer.next();
  expect(token.type).toBe(TOKEN_TYPE.CloseBracket);

  token = lexer.next();
  expect(token.type).toBe(TOKEN_TYPE.Comma);

  token = lexer.next();
  expect(token.type).toBe(TOKEN_TYPE.String);
  expect(token.value).toBe('obj');

  token = lexer.next();
  expect(token.type).toBe(TOKEN_TYPE.Colon);

  token = lexer.next();
  expect(token.type).toBe(TOKEN_TYPE.OpenBrace);

  token = lexer.next();
  expect(token.type).toBe(TOKEN_TYPE.String);
  expect(token.value).toBe('un');

  token = lexer.next();
  expect(token.type).toBe(TOKEN_TYPE.Colon);

  token = lexer.next();
  expect(token.type).toBe(TOKEN_TYPE.Identifier);
  expect(token.value).toBe(null);

  token = lexer.next();
  expect(token.type).toBe(TOKEN_TYPE.CloseBrace);

  token = lexer.next();
  expect(token.type).toBe(TOKEN_TYPE.CloseBrace);
});

test('value 为汉字', () => {
  expect(() => {
    const input = `{
      "resource": "活动url"
    }`;

    new Lexer(input);
  }).toThrow(Error);
});

test('invalid value', () => {
  expect(() => {
    const input = `{
      "bb": 1ab34
    }`;

    new Lexer(input);
  }).toThrow(Error);
});

test('invalid comment', () => {
  expect(() => {
    const input = `{
      "cc": 12 /  comment
    }`;

    new Lexer(input);
  }).toThrow(Error);
});
