export interface CommandHistoryEntry {
    id: string;
    commandName: string;
    origin: string;
    sequenceNumber: number;
    commandId: CommandId;
    attr: CommandHistoryAttribute[];
    generationTime: string;  // RFC 3339 timestamp
    assignments: CommandAssignment[];
  }
export interface CommandId {
    generationTime: string;  // String decimal
    origin: string;
    sequenceNumber: number;
    commandName: string;
  }
  
export interface CommandHistoryAttribute {
    name: string;
    value: Value;
    time: string;  // String decimal
  }
  
  // Union type for storing a value
export interface Value {
    type: Type;
    floatValue: number;
    doubleValue: number;
    sint32Value: number;
    uint32Value: number;
    binaryValue: string;  // Base64
    stringValue: string;
    timestampValue: string;  // String decimal
    uint64Value: string;  // String decimal
    sint64Value: string;  // String decimal
    booleanValue: boolean;
    aggregateValue: AggregateValue;
    arrayValue: Value[];
  }
  
  // An aggregate value is an ordered list of (member name, member value).
  // Two arrays are used in order to be able to send just the values (since
  // the names will not change)
export interface AggregateValue {
    name: string[];
    value: Value[];
  }
  
export interface CommandAssignment {
    name: string;
    value: Value;
    userInput: boolean;
  }
  
  enum Type {
    FLOAT = "FLOAT",
    DOUBLE = "DOUBLE",
    UINT32 = "UINT32",
    SINT32 = "SINT32",
    BINARY = "BINARY",
    STRING = "STRING",
    TIMESTAMP = "TIMESTAMP",
    UINT64 = "UINT64",
    SINT64 = "SINT64",
    BOOLEAN = "BOOLEAN",
    AGGREGATE = "AGGREGATE",
    ARRAY = "ARRAY",
  
    // Enumerated values have both an integer (sint64Value) and a string representation
    ENUMERATED = "ENUMERATED",
    NONE = "NONE",
  }