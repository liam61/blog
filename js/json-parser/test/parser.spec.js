import Lexer from '../dist/lexer';
import Parser from '../dist/parser';

test('parser simple', () => {
  const input = `{
    "resource": "song|arrString", // comment after |string,
    "ab": true,
    // comment line
    "num": 123
  }`;

  const lexer = new Lexer(input);
  const parser = new Parser(lexer);
  const value = parser.parseJSON();
  expect(value).toBe(
    '{ "resource": ["song", "arrString", ], "ab": "true", "num": "123",  }, ',
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
    '{ "cc": ["1", "asr4", { "objInArr": "false",  }, ], "obj": { "un": "null",  },  }, ',
  );
});

test('parse barer array', () => {
  const input = `[1, "str", true, { "a": 4 }]`;

  const lexer = new Lexer(input);
  const parser = new Parser(lexer);
  const value = parser.parseJSON();
  expect(value).toBe('["1", "str", "true", { "a": "4",  }, ], ');
});


test('parse empty', () => {
  const input = `{
    "aa": {},
    "bb": []
  }`;

  const lexer = new Lexer(input);
  const parser = new Parser(lexer);
  const value = parser.parseJSON();
  console.log(value);
  expect(value).toBe('{ "aa": {  },  }, ');
});
