export interface Ranges {
    range: Range[];
  }
export interface Range {

    // Generation time of a parameter value.
    start: string;  // RFC 3339 timestamp
  
    // If the value changes, ``stop`` is the generation time of the new value.
    // If the parameter expires or the ``maxGap`` has been set, ``stop`` is
    // the generation time of the last value plus the expiration time or the
    // ``maxGap``.
    stop: string;  // RFC 3339 timestamp
  
    // Deprecated. Use ``start`` instead.
    timeStart: string;
  
    // Deprecated. Use ``stop`` instead.
    timeStop: string;
  
    // Number of parameter values received in the interval.
    // This is the total count of parameters in the interval.
    // If the count does not match the sum(counts), it means that not all the values have been sent
    count: number;
  
    // Since Yamcs 5.4.1 there is a new parameter minRange in the GetParameterRangesRequest which allows
    // specifying the minimum length of the range returned.
    // Practically we guarantee that stop-start >= minRange (mind the leap seconds!).
    //
    // If the minRange parameter is set, the returning ranges may include multiple values.
    // These are given by the engValues and counts below.
    //
    // Since Yamcs 5.4.2 there is a new parameter maxValues which allows to limit the number
    // of distinct values returned across all the ranges.
    // In order to not return ranges containing no value, each range will have at least one value even if
    // that will cause the total number of range values returned to exceed the maxValues parameter
    //
    // The counts correspond one to one to the engValues, the two arrays will always have the same length.
    engValues: Value[];
  
    // The counts correspond one to one to the engValues
    counts: number[];
  }
  
  // Union type for storing a value
  interface Value {
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
  interface AggregateValue {
    name: string[];
    value: Value[];
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
