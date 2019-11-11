import { Lexer } from './lexer';
import { TokenType, TOKEN_TYPE } from './tokenType';
import {
  JsonLiteral,
  JsonObject,
  JsonProperty,
  JsonKey,
  JsonArray,
  JsonNode,
  JsonComment,
  JsonString,
} from './jsonNode';
import { OBJECT_STATE, PROPERTY_STATE, ARRAY_STATE } from './parseType';
import JsonVisitor from './jsonVisitor';
import Visitor from './visitor';

export class Parser {
  curToken: TokenType;
  isValidate = true;
  value: JsonNode;
  visitor: Visitor;

  constructor(private lexer: Lexer) {
    this.consume();
    this.value = this.parseValue();
    this.visitor = new JsonVisitor();
  }

  parseJSON(visitor = this.visitor) {
    this.value.accept(visitor);
    return visitor.value;
  }

  parseValue() {
    let parsedValue: JsonNode = null;

    const { type, value } = this.curToken;
    switch (type) {
      case TOKEN_TYPE.Number:
      case TOKEN_TYPE.Identifier:
        parsedValue = new JsonLiteral(JSON.parse(value)); // handle number, bool, null
        this.consume();
        break;
      case TOKEN_TYPE.String:
        parsedValue = this.parseString();
        break;
      case TOKEN_TYPE.Comment:
        parsedValue = new JsonComment(value);
        break;
      default:
        parsedValue = this.parseObject() || this.parseArray();
    }

    return parsedValue;
  }

  parseObject() {
    const obj = new JsonObject();

    let state = OBJECT_STATE.START;
    while (this.curToken) {
      const { type, value } = this.curToken;

      switch (state) {
        case OBJECT_STATE.START:
          if (type === TOKEN_TYPE.OpenBrace) {
            state = OBJECT_STATE.OPEN;
            this.consume();
            break;
          }
          return null;
        case OBJECT_STATE.OPEN: {
          let isReturn = false;
          if (type === TOKEN_TYPE.CloseBrace) isReturn = true;
          else {
            obj.children.push(this.parseProperty());
            state = OBJECT_STATE.PROPERTY;
          }
          if (isReturn) {
            this.consume();
            return obj;
          }
          break;
        }
        case OBJECT_STATE.PROPERTY: {
          let isReturn = false;
          if (type === TOKEN_TYPE.CloseBrace) isReturn = true;
          else if (type === TOKEN_TYPE.Comma) state = OBJECT_STATE.COMMA;
          else throw new Error(`${value} is not matched } or ,`);
          this.consume();
          if (isReturn) return obj;
          break;
        }
        // 继续下一个键值对
        case OBJECT_STATE.COMMA: {
          if (type === TOKEN_TYPE.Comment) {
            obj.children.push(new JsonComment(value));
            this.consume();
          }

          const { nextIndex, tokens } = this.lexer;
          if (nextIndex === tokens.length - 1) return obj; // 因为最后的 , 进入该 case 需容错
          obj.children.push(this.parseProperty());
          state = OBJECT_STATE.PROPERTY;
          break;
        }
      }
    }

    throw new Error('error Eof');
  }

  parseArray() {
    const arr = new JsonArray();

    let state = ARRAY_STATE.START;
    while (this.curToken) {
      const { type, value } = this.curToken;

      switch (state) {
        case ARRAY_STATE.START:
          if (type === TOKEN_TYPE.OpenBracket) {
            state = ARRAY_STATE.OPEN;
            this.consume();
            break;
          }
          return null;
        case ARRAY_STATE.OPEN: {
          let isReturn = false;
          if (type === TOKEN_TYPE.CloseBracket) isReturn = true;
          else {
            arr.children.push(this.parseValue());
            state = ARRAY_STATE.VALUE;
          }
          if (isReturn) {
            this.consume();
            return arr;
          }
          break;
        }
        case ARRAY_STATE.VALUE: {
          let isReturn = false;
          if (type === TOKEN_TYPE.CloseBracket) isReturn = true;
          else if (type === TOKEN_TYPE.Comma) {
            state = ARRAY_STATE.COMMA;
          } else throw new Error('error value in array');
          this.consume();
          if (isReturn) return arr;
          break;
        }
        case ARRAY_STATE.COMMA: {
          arr.children.push(this.parseValue());
          state = ARRAY_STATE.VALUE;
          break;
        }
      }
    }

    throw new Error('error Eof');
  }

  // 处理键值对
  parseProperty() {
    const property = new JsonProperty();

    let state = PROPERTY_STATE.START;
    while (this.curToken) {
      const { type, value } = this.curToken;

      switch (state) {
        case PROPERTY_STATE.START:
          if (type === TOKEN_TYPE.String) {
            property.key = new JsonKey(value);
            state = PROPERTY_STATE.KEY;
            this.consume();
            break;
          }
          return null;
        case PROPERTY_STATE.KEY:
          if (type === TOKEN_TYPE.Colon) {
            state = PROPERTY_STATE.COLON;
            this.consume();
            break;
          }
          throw new Error(`${value} is not matched :`);
        case PROPERTY_STATE.COLON:
          property.value = this.parseValue();
          return property;
      }
    }
  }

  parseString() {
    const str = new JsonString(this.curToken.value);
    this.consume();

    while (this.curToken) {
      switch (this.curToken.type) {
        case TOKEN_TYPE.Comma:
          return str;
        case TOKEN_TYPE.BitOr:
          this.consume();
          // @ts-ignore
          if (this.curToken.type === TOKEN_TYPE.String) {
            str.sibling.push(new JsonString(this.curToken.value));
            this.consume();
          } else {
            // throw new Error('this is no more sibling string');
          }
      }
    }

    throw new Error('error Eof');
  }

  consume() {
    this.curToken = this.lexer.next();
  }
}
