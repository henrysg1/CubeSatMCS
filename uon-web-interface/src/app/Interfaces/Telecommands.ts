export interface ListCommandsResponse {
  spaceSystems: string[];
  commands: CommandInfo[];

  // Token indicating the response is only partial. More results can then
  // be obtained by performing the same request (including all original
  // query parameters) and setting the ``next`` parameter to this token.
  continuationToken: string;

  // The total number of results (across all pages)
  totalSize: number;
}

export interface CommandInfo {
  name: string;
  qualifiedName: string;
  shortDescription: string;
  longDescription: string;
  alias: NamedObjectId[];
  baseCommand: CommandInfo;
  abstract: boolean;
  argument: ArgumentInfo[];
  argumentAssignment: ArgumentAssignmentInfo[];
  significance: SignificanceInfo;
  constraint: TransmissionConstraintInfo[];
  commandContainer: CommandContainerInfo;
  verifier: VerifierInfo[];
  ancillaryData: {[key: string]: any};
}

// Used by external clients to identify an item in the Mission Database
// If namespace is set, then the name is that of an alias, rather than
// the qualified name.
interface NamedObjectId {
  name: string;
  namespace: string;
}

export interface ArgumentInfo {
  name: string;
  description: string;
  initialValue: string;
  type: ArgumentTypeInfo;
}

export interface ArgumentTypeInfo {
  engType: string;
  dataEncoding: DataEncodingInfo;
  unitSet: UnitInfo[];

  // Enumeration states (only used by enumerated arguments)
  enumValue: EnumValue[];

  // Minimum value (only used by integer and float arguments)
  rangeMin: number;

  // Maximum value (only used by integer and float arguments)
  rangeMax: number;

  // Member information (only used by aggregate arguments)
  member: ArgumentMemberInfo[];

  // String representation of a boolean zero (only used by boolean arguments)
  zeroStringValue: string;

  // String representation of a boolean one (only used by boolean arguments)
  oneStringValue: string;

  // Minimum character count (only used by string arguments)
  minChars: number;

  // Maximum character count (only used by string arguments)
  maxChars: number;

  // True if the engineering type supports signed representation.
  // (only used by integer arguments)
  signed: boolean;

  // Minimum byte count (only used by binary arguments)
  minBytes: number;

  // Maximum character count (only used by binary arguments)
  maxBytes: number;

  // Length of each dimension (only used by array arguments)
  dimensions: ArgumentDimensionInfo[];

  // Type of array entries (only used by array arguments)
  elementType: ArgumentTypeInfo;
}

interface DataEncodingInfo {
  type: Type;
  littleEndian: boolean;
  sizeInBits: number;
  encoding: string;
  defaultCalibrator: CalibratorInfo;
  contextCalibrator: ContextCalibratorInfo[];
}

interface CalibratorInfo {
  polynomialCalibrator: PolynomialCalibratorInfo;
  splineCalibrator: SplineCalibratorInfo;
  javaExpressionCalibrator: JavaExpressionCalibratorInfo;
  type: Type;
}

interface PolynomialCalibratorInfo {
  coefficient: number[];
}

interface SplineCalibratorInfo {
  point: SplinePointInfo[];
}

interface SplinePointInfo {
  raw: number;
  calibrated: number;
}

interface JavaExpressionCalibratorInfo {
  formula: string;
}

interface ContextCalibratorInfo {
  comparison: ComparisonInfo[];
  calibrator: CalibratorInfo;

  // This can be used in UpdateParameterRequest to pass a context
  // that is parsed on the server, according to the rules in the
  // excel spreadsheet. Either this or a comparison has to be
  // used (not both at the same time)
  context: string;
}

interface ComparisonInfo {
  parameter: ParameterInfo;
  operator: OperatorType;
  value: string;
  argument: ArgumentInfo;
}

interface ParameterInfo {
  name: string;
  qualifiedName: string;
  shortDescription: string;
  longDescription: string;
  alias: NamedObjectId[];
  type: ParameterTypeInfo;
  dataSource: DataSourceType;
  usedBy: UsedByInfo;
  ancillaryData: {[key: string]: any};

  // Operations that return aggregate members or array entries
  // may use this field to indicate the path within the parameter.
  path: string[];
}

interface ParameterTypeInfo {
  engType: string;
  dataEncoding: DataEncodingInfo;
  unitSet: UnitInfo[];
  defaultAlarm: AlarmInfo;
  enumValue: EnumValue[];
  absoluteTimeInfo: AbsoluteTimeInfo;
  contextAlarm: ContextAlarmInfo[];
  member: MemberInfo[];
  arrayInfo: ArrayInfo;
  ancillaryData: {[key: string]: any};

  // Provides hints on how to format the engineering
  // value as a string.
  numberFormat: NumberFormatTypeInfo;
  signed: boolean;
}

interface UnitInfo {
  unit: string;
}

interface AlarmInfo {
  minViolations: number;
  staticAlarmRange: AlarmRange[];
  enumerationAlarm: EnumerationAlarm[];
}

interface AlarmRange {
  level: AlarmLevelType;
  minInclusive: number;
  maxInclusive: number;
  minExclusive: number;
  maxExclusive: number;
}

interface EnumerationAlarm {
  level: AlarmLevelType;
  label: string;
}

interface EnumValue {
  value: string;  // String decimal
  label: string;
  description: string;
}

interface AbsoluteTimeInfo {
  initialValue: string;
  scale: number;
  offset: number;
  offsetFrom: ParameterInfo;
  epoch: string;
}

interface ContextAlarmInfo {
  comparison: ComparisonInfo[];
  alarm: AlarmInfo;

  // This can be used in UpdateParameterRequest to pass a context
  // that is parsed on the server, according to the rules in the
  // excel spreadsheet. Either this or a comparison has to be
  // used (not both at the same time)
  context: string;
}

interface MemberInfo {
  name: string;
  shortDescription: string;
  longDescription: string;
  alias: NamedObjectId[];
  type: ParameterTypeInfo;
}

interface ArrayInfo {
  type: ParameterTypeInfo;
  dimensions: ParameterDimensionInfo[];
}

interface ParameterDimensionInfo {
  fixedValue: string;  // String decimal
  parameter: ParameterInfo;
  slope: string;  // String decimal
  intercept: string;  // String decimal
}

interface NumberFormatTypeInfo {
  numberBase: string;
  minimumFractionDigits: number;
  maximumFractionDigits: number;
  minimumIntegerDigits: number;
  maximumIntegerDigits: number;
  negativeSuffix: string;
  positiveSuffix: string;
  negativePrefix: string;
  positivePrefix: string;
  showThousandsGrouping: boolean;
  notation: string;
}

interface UsedByInfo {
  algorithm: AlgorithmInfo[];
  container: ContainerInfo[];
}

interface AlgorithmInfo {
  name: string;
  qualifiedName: string;
  shortDescription: string;
  longDescription: string;
  alias: NamedObjectId[];
  scope: Scope;
  language: string;
  text: string;
  inputParameter: InputParameterInfo[];
  outputParameter: OutputParameterInfo[];
  onParameterUpdate: ParameterInfo[];
  onPeriodicRate: string[];  // String decimal
}

interface InputParameterInfo {
  parameter: ParameterInfo;
  inputName: string;
  parameterInstance: number;
  mandatory: boolean;
  argument: ArgumentInfo;
}

interface OutputParameterInfo {
  parameter: ParameterInfo;
  outputName: string;
}

interface ContainerInfo {
  name: string;
  qualifiedName: string;
  shortDescription: string;
  longDescription: string;
  alias: NamedObjectId[];
  maxInterval: string;  // String decimal
  sizeInBits: number;
  baseContainer: ContainerInfo;
  restrictionCriteria: ComparisonInfo[];
  entry: SequenceEntryInfo[];
  usedBy: UsedByInfo;
  ancillaryData: {[key: string]: any};
}

interface SequenceEntryInfo {
  locationInBits: number;
  referenceLocation: ReferenceLocationType;

  // For use in sequence containers
  container: ContainerInfo;
  parameter: ParameterInfo;

  // For use in command containers
  argument: ArgumentInfo;
  fixedValue: FixedValueInfo;
  repeat: RepeatInfo;
}

interface FixedValueInfo {
  name: string;
  hexValue: string;
  sizeInBits: number;
}

interface RepeatInfo {
  fixedCount: string;  // String decimal
  dynamicCount: ParameterInfo;
  bitsBetween: number;
}

export interface ArgumentMemberInfo {
  name: string;
  shortDescription: string;
  longDescription: string;
  alias: NamedObjectId[];
  type: ArgumentTypeInfo;
  initialValue: string;
}

interface ArgumentDimensionInfo {

  // Use a fixed integer value. If set, no other options are applicable.
  // This value describes the length.
  fixedValue: string;  // String decimal

  // Use the value of the referenced parameter.
  // The value describes the zero-based ending index (length - 1)
  //
  // For a value ``v``, the dimension's length is determined
  // as: ``(v * slope) + intercept``.
  parameter: ParameterInfo;

  // Use the value of the referenced argument.
  // The value describes the zero-based ending index (length - 1)
  //
  // For a value ``v``, the dimension's length is determined
  // as: ``(v * slope) + intercept``.
  argument: string;

  // Scale the value obtained from a parameter or argument reference.
  slope: string;  // String decimal

  // Shift the value obtained from a parameter or argument reference.
  intercept: string;  // String decimal
}

export interface ArgumentAssignmentInfo {
  name: string;
  value: string;
}

interface SignificanceInfo {
  consequenceLevel: SignificanceLevelType;
  reasonForWarning: string;
}

interface TransmissionConstraintInfo {
  expression: string;
  timeout: string;  // String decimal
}

export interface CommandContainerInfo {
  name: string;
  qualifiedName: string;
  shortDescription: string;
  longDescription: string;
  alias: NamedObjectId[];
  sizeInBits: number;
  baseContainer: CommandContainerInfo;
  entry: SequenceEntryInfo[];
}

interface VerifierInfo {
  stage: string;
  container: ContainerInfo;
  algorithm: AlgorithmInfo;
  onSuccess: TerminationActionType;
  onFail: TerminationActionType;
  onTimeout: TerminationActionType;
  checkWindow: CheckWindowInfo;
}

interface CheckWindowInfo {
  timeToStartChecking: string;  // String decimal
  timeToStopChecking: string;  // String decimal
  relativeTo: string;
}

enum Type {
  BINARY = "BINARY",
  BOOLEAN = "BOOLEAN",
  FLOAT = "FLOAT",
  INTEGER = "INTEGER",
  STRING = "STRING",
}

enum Type {
  POLYNOMIAL = "POLYNOMIAL",
  SPLINE = "SPLINE",
  MATH_OPERATION = "MATH_OPERATION",
  JAVA_EXPRESSION = "JAVA_EXPRESSION",
}

enum AlarmLevelType {
  NORMAL = "NORMAL",
  WATCH = "WATCH",
  WARNING = "WARNING",
  DISTRESS = "DISTRESS",
  CRITICAL = "CRITICAL",
  SEVERE = "SEVERE",
}

enum DataSourceType {
  TELEMETERED = "TELEMETERED",
  DERIVED = "DERIVED",
  CONSTANT = "CONSTANT",
  LOCAL = "LOCAL",
  SYSTEM = "SYSTEM",
  COMMAND = "COMMAND",
  COMMAND_HISTORY = "COMMAND_HISTORY",
  EXTERNAL1 = "EXTERNAL1",
  EXTERNAL2 = "EXTERNAL2",
  EXTERNAL3 = "EXTERNAL3",
}

enum Scope {
  GLOBAL = "GLOBAL",
  COMMAND_VERIFICATION = "COMMAND_VERIFICATION",
  CONTAINER_PROCESSING = "CONTAINER_PROCESSING",
}

enum ReferenceLocationType {
  CONTAINER_START = "CONTAINER_START",
  PREVIOUS_ENTRY = "PREVIOUS_ENTRY",
}

enum OperatorType {
  EQUAL_TO = "EQUAL_TO",
  NOT_EQUAL_TO = "NOT_EQUAL_TO",
  GREATER_THAN = "GREATER_THAN",
  GREATER_THAN_OR_EQUAL_TO = "GREATER_THAN_OR_EQUAL_TO",
  SMALLER_THAN = "SMALLER_THAN",
  SMALLER_THAN_OR_EQUAL_TO = "SMALLER_THAN_OR_EQUAL_TO",
}

enum SignificanceLevelType {
  NONE = "NONE",
  WATCH = "WATCH",
  WARNING = "WARNING",
  DISTRESS = "DISTRESS",
  CRITICAL = "CRITICAL",
  SEVERE = "SEVERE",
}

enum TerminationActionType {
  SUCCESS = "SUCCESS",
  FAIL = "FAIL",
}

export interface CustomTelecommand{
  [key: string]: any;
}

export interface CustomTelecommandResponse{
  commandResponse: any;
  yamcsInstanceName: string;
}

export var globalTelecommandsArray: CommandInfo[] = [];