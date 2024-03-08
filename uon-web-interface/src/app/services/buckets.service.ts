import { Injectable } from "@angular/core";
import { yamcsBaseUrl } from "../Interfaces/GraphData";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import {
  BucketInfo,
  CreateBucketRequest,
  ListBucketsResponse,
  ListObjectsResponse,
} from "../Interfaces/Buckets";
import { BehaviorSubject, Observable, catchError, throwError } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class BucketsService {
  public bucketsUrl = `${yamcsBaseUrl}/buckets/_global`;
  public objectsUrl = `${this.bucketsUrl}/files/objects`;

  private showBucket = new BehaviorSubject<boolean>(true);
  currentshowBucket = this.showBucket.asObservable();

  private bucketName = new BehaviorSubject<string>("files");
  currentbucketName = this.bucketName.asObservable();

  constructor(private http: HttpClient) {}

  getBucketsResponse(): Observable<ListBucketsResponse> {
    return this.http.get<ListBucketsResponse>(this.bucketsUrl);
  }

  getObjectsResponse(): Observable<ListObjectsResponse> {
    // console.log(this.objectsUrl);
    return this.http.get<ListObjectsResponse>(this.objectsUrl);
  }
  postObjectsResponse(formData:FormData, fileName:string):Observable<unknown>{
    const url= this.objectsUrl+"/"+fileName;
    return this.http.post(url,formData).pipe(catchError(this.handleError));
    
  
  }

  deleteObjectsResponse(objectName:string):Observable<unknown>{
    const url= this.objectsUrl+"/"+objectName;
   return this.http.delete(url).pipe(catchError(this.handleError))
  }

  changeshowBucket(bucket: boolean) {
    this.showBucket.next(bucket);
  }

  changeBucketName(bucketfileName: string) {
    this.bucketName.next(bucketfileName);
    this.bucketName.subscribe((fileName) => {
      this.objectsUrl = this.bucketsUrl.concat("/", fileName, "/objects");
    });
  }

  createBuckets(newBucketName: string): Observable<CreateBucketRequest> {
    const newBucket: CreateBucketRequest = {
      name: newBucketName,
    };

    return this.http
      .post<CreateBucketRequest>(this.bucketsUrl, newBucket)
      .pipe(catchError(this.handleError));
  }

  deleteBucket(deleteBucketName: string): Observable<unknown> {
    const url = `${this.bucketsUrl}/${deleteBucketName}`; // DELETE bucket
    return this.http.delete(url).pipe(catchError(this.handleError));
  }

  handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error("An error occurred:", error.error);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      alert(
        `Error occured while editing the bucket. Error: ${error.error.msg}`
      );
      console.error(
        `Backend returned code ${error.status}, body was: `,
        error.error
      );
    }
    // Return an observable with a user-facing error message.
    return throwError(
      () => new Error("Something bad happened; please try again later.")
    );
  }
}
