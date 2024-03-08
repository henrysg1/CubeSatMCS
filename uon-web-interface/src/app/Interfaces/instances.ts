export interface ListInstancesResponse {
  instances: YamcsInstance[];
}

export interface YamcsInstance {
  // Instance name.
  name: string;
  missionDatabase: MissionDatabase;
  processors: ProcessorInfo[];
  state: InstanceState;

  //in case the state=FAILED, this field will indicate the cause of the failure
  // the missionDatabase and other fields may not be filled when this happens
  failureCause: string;
  missionTime: string; // RFC 3339 timestamp

  // Labels assigned to this instance. Each entry is keyed by the tag name
  // of the label. The value represent the label value for that tag.
  labels: { [key: string]: string };

  // Feature capability hints for client use
  capabilities: string[];

  // Name of the template, if this instance was generated
  template: string;

  // Arguments used during template processing, if this instance
  // was generated
  templateArgs: { [key: string]: string };

  // Whether the template is stil available
  templateAvailable: boolean;

  // Whether the template has changed since this instance was
  // generated
  templateChanged: boolean;
}

export interface MissionDatabase {
  // This is the config section in mdb.yaml
  configName: string;

  // Root space-system name
  name: string;

  // Root space-system header version
  version: string;
  spaceSystem: SpaceSystemInfo[];
  parameterCount: number;
  containerCount: number;
  commandCount: number;
  algorithmCount: number;
  parameterTypeCount: number;
}

export interface SpaceSystemInfo {
  name: string;
  qualifiedName: string;
  shortDescription: string;
  longDescription: string;
  alias: NamedObjectId[];
  version: string;
  history: HistoryInfo[];
  sub: SpaceSystemInfo[];
  ancillaryData: { [key: string]: any }; // AncillaryDataInfo was the original but is not defined
}

// Used by external clients to identify an item in the Mission Database
// If namespace is set, then the name is that of an alias, rather than
// the qualified name.
export interface NamedObjectId {
  name: string;
  namespace: string;
}

export interface HistoryInfo {
  version: string;
  date: string;
  message: string;
  author: string;
}

export interface ProcessorInfo {
  // Yamcs instance name.
  instance: string;

  // Processor name.
  name: string;
  type: string;
  spec: string;
  creator: string;
  hasAlarms: boolean;
  hasCommanding: boolean;
  state: ServiceState;
  replayRequest: ReplayRequest;
  replayState: ReplayState;
  services: ServiceInfo[];
  persistent: boolean;
  time: string; // RFC 3339 timestamp
  replay: boolean;
  checkCommandClearance: boolean;

  // If true, this processor can not be deleted.
  protected: boolean;

  // Globally available acknowledgments (in addition to Acknowledge_Queued,
  // Acknowledge_Released and Acknowledge_Sent)
  acknowledgments: AcknowledgmentInfo[];
}

//used to replay (concurrently) TM packets, parameters and events
export interface ReplayRequest {
  // **Required.** The time at which the replay should start.
  start: string; // RFC 3339 timestamp

  // The time at which the replay should stop.
  // If unspecified, the replay will keep going as long  as there is remaining data.
  stop: string; // RFC 3339 timestamp

  //what should happen at the end of the replay
  endAction: EndAction;

  //how fast the replay should go
  speed: ReplaySpeed;

  // Reverse the direction of the replay
  reverse: boolean;
  parameterRequest: ParameterReplayRequest;

  // By default all Packets, Events, CommandHistory are part of the replay
  // Unless one or more of the below requests are specified.
  packetRequest: PacketReplayRequest;
  eventRequest: EventReplayRequest;
  commandHistoryRequest: CommandHistoryReplayRequest;
  ppRequest: PpReplayRequest;

  // Start the replay following initialization
  // Defaults to true, if unspecified
  autostart: boolean;
}

export interface ReplaySpeed {
  type: ReplaySpeedType;
  param: number;
}

interface ParameterReplayRequest {
  nameFilter: NamedObjectId[];
  sendRaw: boolean;
  performMonitoring: boolean;
}

interface PacketReplayRequest {
  // No filter, means all packets for which privileges exist, are sent
  nameFilter: NamedObjectId[];

  //if specified, only replay packets originally received on one of those links
  tmLinks: string[];
}

interface EventReplayRequest {}

interface CommandHistoryReplayRequest {
  // No filter, means all command history entries are sent
  nameFilter: NamedObjectId[];
}

//Request to replay parameters - they can be filtered by the parameter group
interface PpReplayRequest {
  // No filter, means all pp groups are sent
  groupNameFilter: string[];

  // exclude the parameters from these groups
  //   this takes precedence over the filter above (i.e. if a group is part of both, it will be excluded)
  groupNameExclude: string[];
}

interface ServiceInfo {
  // Yamcs instance name
  instance: string;

  // Service name
  name: string;

  // Service state
  state: ServiceState;

  // Java class name
  className: string;

  // Processor name (in case this is a processor service)
  processor: string;

  // Short failure message when `state` is FAILED.
  failureMessage: string;

  // Stacktrace when `state` is FAILED.
  failureCause: string;
}

interface AcknowledgmentInfo {
  // Acknowledgment name
  name: string;

  // Description of the acknowledgment
  description: string;
}

enum ServiceState {
  // A service in this state is inactive. It does minimal work and
  // consumes minimal resources.
  NEW = "NEW",

  // A service in this state is transitioning to ``RUNNING``.
  STARTING = "STARTING",

  // A service in this state is operational.
  RUNNING = "RUNNING",

  // A service in this state is transitioning to ``TERMINATED``.
  STOPPING = "STOPPING",

  // A service in this state has completed execution normally.
  // It does minimal work and consumes minimal resources.
  TERMINATED = "TERMINATED",

  // A service in this state has encountered a problem and may
  // not be operational. It cannot be started nor stopped.
  FAILED = "FAILED",
}

enum EndAction {
  LOOP = "LOOP",
  QUIT = "QUIT",
  STOP = "STOP",
}

enum ReplaySpeedType {
  AFAP = "AFAP",
  FIXED_DELAY = "FIXED_DELAY",
  REALTIME = "REALTIME",
  STEP_BY_STEP = "STEP_BY_STEP",
}

enum ReplayState {
  // just at the beginning or when the replay request (start, stop or packet selection) changes
  INITIALIZATION = "INITIALIZATION",
  RUNNING = "RUNNING",

  // The replay has reached the end with the endaction stop
  STOPPED = "STOPPED",

  // The replay stopped due to an error.
  ERROR = "ERROR",
  PAUSED = "PAUSED",

  // The replay is finished and closed
  CLOSED = "CLOSED",
}

enum InstanceState {
  OFFLINE = "OFFLINE",
  INITIALIZING = "INITIALIZING",
  INITIALIZED = "INITIALIZED",
  STARTING = "STARTING",
  RUNNING = "RUNNING",
  STOPPING = "STOPPING",
  FAILED = "FAILED",
}
