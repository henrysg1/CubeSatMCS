import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";

@Component({
  selector: "app-bucket-item-dialog",
  templateUrl: "./bucket-item-dialog.component.html",
  styleUrls: ["./bucket-item-dialog.component.css"],
})
export class BucketItemDialogComponent implements OnInit {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}

  ngOnInit(): void {}
}
