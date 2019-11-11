import { PARSE_TYPE } from './parseType';
import Visitor from './visitor';

export class JsonNode {
  children: JsonNode[];
  key: JsonKey;
  value: any;
  raw?: string;
  sibling?: JsonString[]; // only for JsonString

  constructor(public type: PARSE_TYPE) {}

  accept(visitor: Visitor) {
    visitor.visit(this);
  }
}

export class JsonObject extends JsonNode {
  children: Array<JsonProperty | JsonComment> = [];

  constructor() {
    super(PARSE_TYPE.Object);
  }

  accept(visitor: Visitor) {
    visitor.visitObject(this);
  }
}

// 键值对
export class JsonProperty extends JsonNode {
  key: JsonKey;
  value: JsonObject | JsonArray | JsonString | JsonLiteral;

  constructor() {
    super(PARSE_TYPE.Property);
  }

  accept(visitor: Visitor) {
    visitor.visitProperty(this);
  }
}

export class JsonKey extends JsonNode {
  constructor(public value: string, public raw?: string) {
    super(PARSE_TYPE.Key);
  }

  accept(visitor: Visitor) {
    visitor.visitKey(this);
  }
}

export class JsonArray extends JsonNode {
  children: Array<JsonObject | JsonArray | JsonLiteral> = [];

  constructor() {
    super(PARSE_TYPE.Array);
  }

  accept(visitor: Visitor) {
    visitor.visitArray(this);
  }
}

export class JsonString extends JsonNode {
  sibling?: JsonString[] = [];

  constructor(public value: string) {
    super(PARSE_TYPE.String);
  }

  accept(visitor: Visitor) {
    visitor.visitString(this);
  }
}

export class JsonLiteral extends JsonNode {
  constructor(public value: number | boolean | null) {
    super(PARSE_TYPE.Literal);
  }

  accept(visitor: Visitor) {
    visitor.visitLiteral(this);
  }
}

export class JsonComment extends JsonNode {
  constructor(public value: string, public raw?: string) {
    super(PARSE_TYPE.Comment);
  }

  accept(visitor: Visitor) {
    visitor.visitComment(this);
  }
}
