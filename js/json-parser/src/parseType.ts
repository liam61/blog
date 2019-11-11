export enum PARSE_TYPE {
  Object = 'Object',
  Array = 'Array',
  Property = 'Property',
  Key = 'Key',
  String = 'String',
  Literal = 'Literal', // number | bool | null
  Comment = 'Comment',
}

export enum OBJECT_STATE {
  START,
  OPEN,
  PROPERTY,
  COMMA,
}

export enum PROPERTY_STATE {
  START,
  KEY,
  COLON,
}

export enum ARRAY_STATE {
  START,
  OPEN,
  VALUE,
  COMMA,
}
