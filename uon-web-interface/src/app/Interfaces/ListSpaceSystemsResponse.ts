export interface ListSpaceSystemsResponse {
  spaceSystems: SpaceSystemInfo[];

  // Token indicating the response is only partial. More results can then
  // be obtained by performing the same request (including all original
  // query parameters) and setting the ``next`` parameter to this token.
  continuationToken: string;

  // The total number of results (across all pages)
  totalSize: number;
}

interface SpaceSystemInfo {
  name: string;
  qualifiedName: string;
  shortDescription: string;
  longDescription: string;
  alias: NamedObjectId[];
  version: string;
  history: HistoryInfo[];
  sub: SpaceSystemInfo[];
  ancillaryData: { [key: string]: any };
}

// Used by external clients to identify an item in the Mission Database
// If namespace is set, then the name is that of an alias, rather than
// the qualified name.
interface NamedObjectId {
  name: string;
  namespace: string;
}

interface HistoryInfo {
  version: string;
  date: string;
  message: string;
  author: string;
}
