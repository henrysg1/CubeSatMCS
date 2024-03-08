import { Component, Inject, OnInit, Output } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

@Component({
  selector: "app-bucket-dialog",
  templateUrl: "./bucket-dialog.component.html",
  styleUrls: ["./bucket-dialog.component.css"],
})
export class BucketDialogComponent implements OnInit {
  BucketNameForm!: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<BucketDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.BucketNameForm = this.fb.group({
      name: ["", [Validators.required]],
    });
  }

  /**
   * the closing of the bucket
   */
  onClose() {
    console.log(this.BucketNameForm.value);
    this.dialogRef.close(this.BucketNameForm.value);
  }
}
