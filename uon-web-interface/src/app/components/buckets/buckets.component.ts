import { HttpClient } from "@angular/common/http";

import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { Observable, firstValueFrom, lastValueFrom } from "rxjs";

import {
  BucketInfo,
  ListBucketsResponse,
  ListObjectsResponse,
  ObjectInfo,
} from "src/app/Interfaces/Buckets";
import { yamcsBaseUrl } from "src/app/Interfaces/GraphData";
import { BucketsService } from "src/app/services/buckets.service";
import { BucketItemDialogComponent } from "../bucket-item-dialog/bucket-item-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import { BucketDialogComponent } from "../bucket-dialog/bucket-dialog.component";

@Component({
  selector: "app-buckets",
  templateUrl: "./buckets.component.html",
  styleUrls: ["./buckets.component.css"],
})
export class BucketsComponent implements OnInit {
  public listOfBuckets: ListBucketsResponse | undefined;
  public buckets: BucketInfo[] = [];
  public displayedCol = [
    "name",
    "numObjects",
    "maxObjects",
    "size",
    "created",
    "freeSpace",
    "delete",
  ];
  public showBucket!: boolean;
  newBucketName!: string;
  bucketNameDelete!: string;

  constructor(
    private bucketService: BucketsService,
    public router: Router,
    public dialog: MatDialog
  ) {}

  async ngOnInit(): Promise<void> {
    //this.downloadUrl = "api/buckets/_global/files/objects/";
    this.listOfBuckets = await lastValueFrom(
      this.bucketService.getBucketsResponse()
    );

    this.buckets = this.listOfBuckets.buckets;
    //console.log(this.buckets);

    this.bucketService.currentshowBucket.subscribe(
      (showBucket) => (this.showBucket = showBucket)
    );
  }

  /**
   * Formats the size of the image to be shown as bytes
   * @param bytes the bytes of the image
   * @param decimals how many decimals do we want to show
   * @returns the size of the file in decimals
   */
  formatBytes(bytes: any, decimals = 2) {
    bytes = Number(bytes);
    if (!+bytes) return "0 Bytes";

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = [
      "Bytes",
      "KiB",
      "MiB",
      "GiB",
      "TiB",
      "PiB",
      "EiB",
      "ZiB",
      "YiB",
    ];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  }

  /**
   * Shows the bucket on the UI
   * @param bucketName the name of the bucket
   */
  showBucketItem(bucketName: string) {
    this.bucketService.changeshowBucket(!this.showBucket);
    this.bucketService.changeBucketName(bucketName);
  }

  /**
   * the creation of a bucket
   */
  createBucket() {
    const dialogRef = this.dialog.open(BucketDialogComponent);

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result != undefined) {
        this.newBucketName = result.name;
        const response = await firstValueFrom(
          this.bucketService.createBuckets(this.newBucketName)
        );
        console.log(response);
        this.refreshComponent();
      }
    });
  }

  /**
   *
   * @param name the name of the bucket to be deleted
   */
  async deleteBucket(name: string) {
    if (confirm("Are you sure you want to delete this bucket?")) {
      this.bucketNameDelete = name;
      const response = await firstValueFrom(
        this.bucketService.deleteBucket(this.bucketNameDelete)
      );
      console.log(response);
      this.refreshComponent();
    }
  }

  /**
   * after deletion or creation of a bucket we need to refresh our component
   */
  refreshComponent() {
    const url = this.router.url;
    this.router.navigateByUrl("/", { skipLocationChange: true }).then(() => {
      this.router.navigate([`/${url}`]).then(() => {}); //refreshes the component
    });
  }
}
