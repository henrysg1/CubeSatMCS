export interface ListBucketsResponse {
  buckets: BucketInfo[];
}

export interface BucketInfo {
  // Bucket name.
  name: string;

  // Total size in bytes of all objects in the bucket (metadata is not counted)
  size: string; // String decimal

  // Number of objects in the bucket
  numObjects: number;

  // Maximum allowed total size of all objects
  maxSize: string; // String decimal

  // Maximum allowed number of objects
  maxObjects: number;

  // Creation time of this bucket
  created: string; // RFC 3339 timestamp

  // Bucket root directory. This field is only set when the
  // bucket is mapped to the file system. Therefore it is not
  // set for buckets that store objects in RocksDB.
  directory: string;
}

export interface ListObjectsResponse {
  prefixes: string[];
  objects: ObjectInfo[];
}

export interface ObjectInfo {
  // Object name
  name: string;

  // Creation time
  created: string; // RFC 3339 timestamp

  // Size in bytes
  size: string; // String decimal
  metadata: { [key: string]: string };
}

export interface CreateBucketRequest {
  // Bucket name.
  name: string;
}
