import { Lexer, Parser } from './src';

const input = `{
  "resource": "song|arrString|", // end of line（| 已做容错）
  "ab": true,
  // comment in line
  "cc": [1, "asr4", { "objInArr": false }],
  "obj": {
    "un": null
  }, // , 已做容错
}`;

const lexer = new Lexer(input);
const parser = new Parser(lexer);

// console.log(lexer.tokens);
console.log(parser.parseJSON());
