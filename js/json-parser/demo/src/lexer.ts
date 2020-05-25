import {
  TokenType,
  TOKEN_TYPE,
  KEY_TOKENS,
  isWhiteSpace,
  isNumber,
  isLetter,
  isNewLine,
} from './tokenType';

export class Lexer {
  curIndex = 0;
  curChar: string;
  tokens: TokenType[] = [];
  nextIndex = -1; // 遍历使用

  constructor(private input: string) {
    this.curChar = this.input.charAt(this.curIndex);
    // debugger;
    this.walk();
  }

  get isEnd() {
    return this.curIndex >= this.input.length;
  }

  walk() {
    while (!this.isEnd) {
      this.parseWhitespace();

      let token: TokenType;
      switch (this.curChar) {
        case TOKEN_TYPE.OpenBrace:
        case TOKEN_TYPE.CloseBrace:
        case TOKEN_TYPE.OpenBracket:
        case TOKEN_TYPE.CloseBracket:
        case TOKEN_TYPE.Colon:
        case TOKEN_TYPE.Comma:
          token = { type: this.curChar, value: this.curChar };
          this.consume();
          break;
        case TOKEN_TYPE.SingleSlash:
          this.consume();
          this.parseComment();
          break;
        case TOKEN_TYPE.Quote:
          this.consume();
          this.parseString();
          break;
        default:
          token = this.parseKeyword() || this.parseNumber();
          if (!token) {
            throw new Error(`${this.curChar} is not a valid type`);
          }
      }
      token && this.tokens.push(token);
    }
  }

  parseString() {
    let buffer = '';

    while (!this.isEnd) {
      switch (this.curChar) {
        case TOKEN_TYPE.BitOr:
          buffer &&
            this.tokens.push({ type: TOKEN_TYPE.String, value: buffer });
          this.tokens.push({
            type: TOKEN_TYPE.BitOr,
            value: TOKEN_TYPE.BitOr,
          });
          buffer = '';
          break;
        case TOKEN_TYPE.Quote:
          buffer &&
            this.tokens.push({ type: TOKEN_TYPE.String, value: buffer });
          this.consume();
          return;
        default:
          if (isLetter(this.curChar)) {
            buffer += this.curChar;
          } else throw new Error(`${this.curChar} is not a valid token`);
      }
      this.consume();
    }
  }

  parseKeyword() {
    let buffer = '';
    KEY_TOKENS.some(name => {
      const key = this.input.substr(this.curIndex, name.length);
      if (key === name) {
        buffer = name;
        this.consume(name.length);
        return true;
      }
    });
    return buffer ? { type: TOKEN_TYPE.Identifier, value: JSON.parse(buffer) } : null;
  }

  parseNumber() {
    let buffer = '';
    while (!this.isEnd && isNumber(this.curChar)) {
      buffer += this.curChar;
      this.consume();
    }
    return buffer ? { type: TOKEN_TYPE.Number, value: +buffer } : null;
  }

  parseComment() {
    if (this.input.charAt(this.curIndex) !== TOKEN_TYPE.SingleSlash) {
      throw new Error(`${this.curChar} is not matched /`);
    }
    this.consume();
    this.parseWhitespace();

    let buffer = '';
    while (!this.isEnd && !isNewLine(this.curChar)) {
      buffer += this.curChar;
      this.consume();
    }
    buffer && this.tokens.push({ type: TOKEN_TYPE.Comment, value: buffer });
  }

  parseWhitespace() {
    while (!this.isEnd && isWhiteSpace(this.curChar)) {
      this.consume();
    }
  }

  consume(step = 1) {
    if (this.isEnd) return;
    this.curIndex += step;
    this.curChar = this.input.charAt(this.curIndex);
  }

  next() {
    return this.nextIndex < this.tokens.length
      ? this.tokens[++this.nextIndex]
      : null;
  }
}
