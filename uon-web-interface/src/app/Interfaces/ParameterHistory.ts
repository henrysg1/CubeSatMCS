export interface ListParameterHistoryResponse {
  parameter: ParameterValue[];

  // Token indicating the response is only partial. More results can then
  // be obtained by performing the same request (including all original
  // query parameters) and setting the ``next`` parameter to this token.
  continuationToken: string;
}

export interface ParameterValue {
  // Parameter identifier
  id: NamedObjectId;

  // Raw value (uncalibrated)
  rawValue: Value;

  // Engineering value (calibrated)
  engValue: Value;

  // Time of Yamcs reception
  acquisitionTime: string; // RFC 3339 timestamp

  // Time of generation (~ packet time)
  generationTime: string; // RFC 3339 timestamp
  acquisitionStatus: AcquisitionStatus;

  // Deprecated: this field was originally introduced for compatibility
  // with Airbus CGS/CD-MCS system. It was redundant, because when false,
  // the acquisitionStatus is also set to INVALID.
  processingStatus: boolean;
  monitoringResult: MonitoringResult;
  rangeCondition: RangeCondition;

  // Context-dependent ranges
  alarmRange: AlarmRange[];

  // How long (in milliseconds) this parameter value is valid
  // Note that there is an option when subscribing to parameters to get
  // updated when the parameter values expire.
  expireMillis: string; // String decimal

  // When transferring parameters over WebSocket, this value might be used
  // instead of the id above in order to reduce the bandwidth.
  // Note that the id <-> numericId assignment is only valid in the context
  // of a single WebSocket call.
  numericId: number;
}

// Used by external clients to identify an item in the Mission Database
// If namespace is set, then the name is that of an alias, rather than
// the qualified name.
interface NamedObjectId {
  name: string;
  namespace: string;
}

// Union type for storing a value
interface Value {
  type: Type;
  floatValue: number;
  doubleValue: number;
  sint32Value: number;
  uint32Value: number;
  binaryValue: string; // Base64
  stringValue: string;
  timestampValue: string; // String decimal
  uint64Value: string; // String decimal
  sint64Value: string; // String decimal
  booleanValue: boolean;
  aggregateValue: AggregateValue;
  arrayValue: Value[];
}

// An aggregate value is an ordered list of (member name, member value).
// Two arrays are used in order to be able to send just the values (since
// the names will not change)
interface AggregateValue {
  name: string[];
  value: Value[];
}

interface AlarmRange {
  level: AlarmLevelType;
  minInclusive: number;
  maxInclusive: number;
  minExclusive: number;
  maxExclusive: number;
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

enum AcquisitionStatus {
  // OK!
  ACQUIRED = "ACQUIRED",

  // No value received so far
  NOT_RECEIVED = "NOT_RECEIVED",

  // Some value has been received but is invalid
  INVALID = "INVALID",

  // The parameter is coming from a packet which has not since updated although it should have been
  EXPIRED = "EXPIRED",
}

enum MonitoringResult {
  DISABLED = "DISABLED",
  IN_LIMITS = "IN_LIMITS",
  WATCH = "WATCH",
  WARNING = "WARNING",
  DISTRESS = "DISTRESS",
  CRITICAL = "CRITICAL",
  SEVERE = "SEVERE",
}

enum RangeCondition {
  LOW = "LOW",
  HIGH = "HIGH",
}

enum AlarmLevelType {
  NORMAL = "NORMAL",
  WATCH = "WATCH",
  WARNING = "WARNING",
  DISTRESS = "DISTRESS",
  CRITICAL = "CRITICAL",
  SEVERE = "SEVERE",
}
