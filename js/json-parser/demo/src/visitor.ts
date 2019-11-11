import {
  JsonObject,
  JsonArray,
  JsonProperty,
  JsonLiteral,
  JsonComment,
  JsonNode,
  JsonKey,
  JsonString,
} from './jsonNode';
import { PARSE_TYPE } from './parseType';

export interface IVisitor {
  visitObject(jsonObject: JsonObject): void;
  visitArray(jsonArray: JsonArray): void;
  visitProperty(jsonProperty: JsonProperty): void;
  visitString(jsonString: JsonString): void;
  visitLiteral(jsonLiteral: JsonLiteral): void;
  visitKey(jsonKey: JsonKey): void;
  visitComment(jsonComment: JsonComment): void;
}

export default abstract class Visitor implements IVisitor {
  value: string;

  visitObject(jsonObject: JsonObject): void {
    throw new Error('Method not implemented.');
  }
  visitArray(jsonArray: JsonArray): void {
    throw new Error('Method not implemented.');
  }
  visitProperty(jsonProperty: JsonProperty): void {
    throw new Error('Method not implemented.');
  }
  visitKey(jsonKey: JsonKey): void {
    throw new Error('Method not implemented.');
  }
  visitString(jsonString: JsonString): void {
    throw new Error('Method not implemented.');
  }
  visitLiteral(jsonLiteral: JsonLiteral): void {
    throw new Error('Method not implemented.');
  }
  visitComment(jsonComment: JsonComment): void {
    throw new Error('Method not implemented.');
  }

  visit(node: JsonNode) {
    switch (node.type) {
      case PARSE_TYPE.Object:
        this.visitObject(node);
        break;
      case PARSE_TYPE.Array:
        this.visitArray(node);
        break;
      case PARSE_TYPE.Key:
        this.visitKey(node);
        break;
      case PARSE_TYPE.Property:
        this.visitProperty(node);
        break;
      case PARSE_TYPE.String:
        this.visitString(node);
        break;
      case PARSE_TYPE.Literal:
        this.visitLiteral(node);
        break;
      case PARSE_TYPE.Comment:
        this.visitComment(node);
        break;
    }
  }
}
