import { Component, OnInit } from "@angular/core";
import { firstValueFrom, lastValueFrom } from "rxjs";
import { ListObjectsResponse, ObjectInfo } from "src/app/Interfaces/Buckets";
import { BucketsService } from "src/app/services/buckets.service";
import { MatDialog } from "@angular/material/dialog";
import { BucketItemDialogComponent } from "../bucket-item-dialog/bucket-item-dialog.component";
import { Router } from "@angular/router";
import { UploadEvent } from "src/app/Interfaces/upload-event";


@Component({
  selector: "app-bucket-item",
  templateUrl: "./bucket-item.component.html",
  styleUrls: ["./bucket-item.component.css"],
})
export class BucketItemComponent implements OnInit {
  public listOfobjects: ListObjectsResponse | undefined;
  public objects: ObjectInfo[] = [];
  public bucketUrl: string = "";
  public downloadUrl: string = "";
  public showBucket!: boolean;
  public bucketName: string = "";

  constructor(
    public router: Router,
    private bucketService: BucketsService,
    public dialog: MatDialog,
    
    
   
    
  ) {}

  async ngOnInit(): Promise<void> {
    this.listOfobjects = await lastValueFrom(
      this.bucketService.getObjectsResponse()
    );
    this.objects = this.listOfobjects.objects;

    this.bucketUrl = this.bucketService.objectsUrl;

    this.bucketService.currentshowBucket.subscribe(
      (showBucket) => (this.showBucket = showBucket)
    );

    this.bucketService.currentbucketName.subscribe(
      (bucketName) => (this.bucketName = bucketName)
    );
    this.downloadUrl = "api/buckets/_global/" + this.bucketName + "/objects/";
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
   * The bucket which is being shown
   */
  showListBucket() {
    this.bucketService.changeshowBucket(!this.showBucket);
  }

  /**
   *
   * @param created the time the file was created
   * @param size the size of the file
   * @param image the image
   */
  openDialog(created: any, size: any, image: any) {
    this.dialog.open(BucketItemDialogComponent, {
      data: {
        created: created,
        size: this.formatBytes(size),
        image: image,
      },
    });
  }
 /**
  * delete the specified bucket item 
  * @param objectsName The name of the item within the bucket, triggering the 'deleteBucketItem' action.
  */
  async deleteBucketItem(objectsName:string){
    if(confirm("Are you sure you want to delete "+objectsName+"?" )){
      const response = await firstValueFrom(
      this.bucketService.deleteObjectsResponse(objectsName)
      );
      console.log(response);
      this.refreshComponent();
     }
  }

  /**
   * Uploads the selected files from the file dialog to the backend.
   * @param event The selected files from the file dialog.
   */
  async onUpload(event: UploadEvent) {
    for (let i=0; i<event.files.length;i++){
    const file:File=event.files[i]
    if(file){
      const formData = new FormData();
      formData.append(file.name,file);
      const response = await firstValueFrom(
      this.bucketService.postObjectsResponse(formData,file.name));
      
      
    }
   
    }
    this.refreshComponent();
    
}

refreshComponent() {
  const url = this.router.url;
  this.router.navigateByUrl("/", { skipLocationChange: true }).then(() => {
    this.router.navigate([`/${url}`]).then(() => {
    }); //refreshes the component
  });
}


}
