import Visitor from './visitor';
import {
  JsonObject,
  JsonArray,
  JsonProperty,
  JsonLiteral,
  JsonComment,
  JsonKey,
  JsonString,
  JsonNode,
} from './jsonNode';

export default class JsonVisitor extends Visitor {
  curNode: JsonNode;
  value = '';

  visitObject(jsonObject: JsonObject) {
    this.value += '{ ';
    jsonObject.children.forEach(node => node.accept(this));
    this.value += ' }, ';
  }

  visitArray(jsonArray: JsonArray) {
    this.value += '[';
    jsonArray.children.forEach(node => this.visit(node));
    this.value += '], ';
  }

  visitProperty(jsonProperty: JsonProperty) {
    jsonProperty.key.accept(this);
    jsonProperty.value.accept(this);
  }

  visitKey(jsonKey: JsonKey) {
    this.curNode = jsonKey;
    this.value += `"${jsonKey.value}": `;
  }

  visitString(jsonString: JsonString) {
    const { value, sibling } = jsonString;
    this.curNode = jsonString;

    if (sibling.length) {
      this.value += `["${value}", `;
      sibling.forEach(js => (this.value += `"${js.value}", `));
      this.value += '], ';
    } else this.value += `"${value}", `;
  }

  visitLiteral(jsonLiteral: JsonLiteral) {
    const { value } = jsonLiteral;
    this.curNode = jsonLiteral;
    this.value += `${value}, `;
  }

  visitComment(jsonComment: JsonComment) {
    console.log(jsonComment.value);
  }
}
