import Lexer from './src/lexer';
import Parser from './src/parser';

const input = `{
  "resource": "song|arrString", // comment after|string,
  "ab": true,
  // comment in line
  "cc": [1, "asr4", { "objInArr": false }],
  "obj": {
    "un": null
  }
}`;

const input2 = `{
  "aa": {},
  "bb": []
}`;

const lexer = new Lexer(input2);
const parser = new Parser(lexer);

// console.log(lexer.tokens);
console.log(parser.parseJSON());
