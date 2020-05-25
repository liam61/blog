import { Lexer, Parser } from '../dist';

test('parser simple', () => {
  const input = `{
    "resource": "song|arrString|", // end of line（最后的 | 已做容错处理）
    "ab": true,
    // comment line
    "num": 123
  }`;

  const lexer = new Lexer(input);
  const parser = new Parser(lexer);
  const value = parser.parseJSON();
  expect(value).toBe(
    '{ "resource": ["song", "arrString", ], "ab": true, "num": 123,  }, ',
  );
});

test('parse object and array', () => {
  const input = `{
    "cc": [1, "asr4", { "objInArr": false }],
    "obj": {
      "un": null
    }
  }`;

  const lexer = new Lexer(input);
  const parser = new Parser(lexer);
  const value = parser.parseJSON();
  expect(value).toBe(
    '{ "cc": [1, "asr4", { "objInArr": false,  }, ], "obj": { "un": null,  },  }, ',
  );
});

test('parse barer array', () => {
  const input = `[1, "str", true, { "a": 4 }]`;

  const lexer = new Lexer(input);
  const parser = new Parser(lexer);
  const value = parser.parseJSON();
  expect(value).toBe('[1, "str", true, { "a": 4,  }, ], ');
});

test('parse empty', () => {
  const input = `{
    "aa": {},
    "bb": [], // 最后的 , 已做容错处理
  }`;

  const lexer = new Lexer(input);
  const parser = new Parser(lexer);
  const value = parser.parseJSON();
  expect(value).toBe('{ "aa": {  }, "bb": [],  }, ');
});

test('missing comma', () => {
  expect(() => {
    const input = `{
      "aa": { "b": 1 }
      "bb": []
    }`;

    const lexer = new Lexer(input);
    new Parser(lexer);
  }).toThrow(Error);
});

test('error array', () => {
  expect(() => {
    const input = `{
      "bb": [1, true } ]
    }`;

    const lexer = new Lexer(input);
    new Parser(lexer);
  }).toThrow(Error);
});

test('error property', () => {
  expect(() => {
    const input = `{
      "aa"{ 123,
      "b": true
    }`;

    const lexer = new Lexer(input);
    new Parser(lexer);
  }).toThrow(Error);
});
