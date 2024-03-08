import { ChangeDetectorRef, Component, OnInit, ViewChild } from "@angular/core";
import { ParameterInfo } from "src/app/Interfaces/ListParameterResponse";
import { TelemetryService } from "src/app/services/telemetry.service";
import { MatTableDataSource } from "@angular/material/table";
import {
  UntypedFormGroup,
  UntypedFormBuilder,
  Validators,
} from "@angular/forms";
import { DataserviceService } from "src/app/services/dataservice.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Sample, TimeSeries } from "src/app/Interfaces/ArchiveParameters";
import { lastValueFrom } from "rxjs";
import { ParameterValue } from "src/app/Interfaces/ParameterHistory";
import { MatStepper } from "@angular/material/stepper";
import {
  timeValidation,
  validationStart,
  validationStop,
} from "../../../validators/time-validation";
import { SharedgraphserviceService } from "src/app/services/sharedgraphservice.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-archive-telemetry",
  templateUrl: "./archive-telemetry.component.html",
  styleUrls: ["./archive-telemetry.component.css"],
})
export class ArchiveTelemetryComponent implements OnInit {
  public folders: string[] = [];
  public folderCol: string[] = ["folder"];
  public displayedCol: string[] = ["telemetry", "type"];
  public firstStep: boolean = false;
  public formFillFields: string[] = ["start", "stop", "count"];
  public secondStep: boolean = false;
  public parameterSendName: string | undefined;
  private start: string = "";
  private stop: string = "";
  private count: string = "";
  private startedit: string = "";
  private stopedit: string = "";
  public starthint: Date = new Date();
  public stophint: Date = new Date();
  qualifiedName: string = "";
  public parameterasync: ParameterInfo[] = [];
  public parameterasyncName: ParameterInfo[] = [];
  private asyncTimeArray: Sample[] = [];
  public asyncHistoryParameter: ParameterValue[] = [];
  tableDataSource!: MatTableDataSource<ParameterInfo>;
  public currentFolder: string = "";
  private samplesData!: TimeSeries;
  // @ViewChild("picker") picker: any;

  archiveTelemetryForm!: UntypedFormGroup;

  constructor(
    private telemetryService: TelemetryService,
    private fb: UntypedFormBuilder,
    private dataservice: DataserviceService,
    private router: Router,
    private snackBar: MatSnackBar,
    private cdRef: ChangeDetectorRef,
    private sharedService: SharedgraphserviceService,
  ) {}

  async ngOnInit(): Promise<void> {
    /**
     * we create the formbuilder group wich will be bined with our input fields for start, stop time and count
     */
    this.archiveTelemetryForm = this.fb.group(
      {
        start: ["", [Validators.required]],
        stop: ["", [Validators.required]],
        count: ["", Validators.required],
      },
      { validator: [timeValidation] }
    );

    /**
     * we bring the data from the telemetry folders
     * this happends asynchronously since we want to wait for all the data to come and then move to the next function
     */

    let spaceSystems = this.telemetryService.getFoldersResponse();

    spaceSystems.then((spaceSystems) => (this.folders = spaceSystems)); // for dynamic folder

    let parameterResponse = await lastValueFrom(
      this.telemetryService.getTelemetryResponse()
    );

    this.parameterasync = parameterResponse.parameters;

    this.dataservice.currentStart.subscribe((start) => (this.start = start));
    this.dataservice.currentStop.subscribe((stop) => (this.stop = stop));
    this.dataservice.currentCount.subscribe((count) => (this.count = count));
    this.telemetryService.currentSample.subscribe(
      (message) => (this.qualifiedName = message)
    );
  }

  /**
   * Pick the parameter from the table and go to the next step
   *
   * @param row - the parameter that was picked
   * @param stepper - the stepper that we use to move to the next step
   */
  async logRowData(row: any, stepper: MatStepper): Promise<void> {
    /**
     * TO DO : add description for the function
     */
    this.dataservice.changeParameterName(row.qualifiedName);

    this.cdRef.detectChanges();
    this.parameterSendName = row.name;
    this.qualifiedName = row.qualifiedName;

    this.telemetryService.changeSample(this.qualifiedName);
    try {
      this.samplesData = await lastValueFrom(
        this.telemetryService.getSamplesValueResponse()
      );
    } catch (error) {
      console.log(error);
    }
    this.asyncTimeArray = this.samplesData.sample;
    if (this.asyncTimeArray == undefined) {
      window.alert("This telemetry has no samples. Please pick another one");
    } else {
      this.secondStep = true;
      this.starthint = this.asyncTimeArray[0].time;
      this.stophint = this.asyncTimeArray[this.asyncTimeArray.length - 1].time;

      this.archiveTelemetryForm
        .get("start")!
        .setValidators([
          validationStart(new Date(this.starthint)),
          Validators.required,
        ]);
      //this.startTime?.setValidators(Validators.required);

      this.startTime?.updateValueAndValidity();
      console.log(this.archiveTelemetryForm.get("start")!.validator);
      this.archiveTelemetryForm
        .get("stop")!
        .setValidators([
          validationStop(new Date(this.stophint)),
          Validators.required,
        ]);
      //this.stopTime?.setValidators(Validators.required);
      this.stopTime?.updateValueAndValidity();
    }

    let historyData = await lastValueFrom(
      this.telemetryService.getHistoryValueResponse()
    );

    this.asyncHistoryParameter = historyData.parameter;

    stepper.next();
    console.log(this.startTime?.errors!["requried"]);
  }

  /**
   *  Take the folder that the user picked from the 1st step
   *
   * @param row - the folder that was picked
   * @param stepper - the stepper that we use to move to the next step
   */
  logFolderRowData(row: any, stepper: MatStepper): void {
    this.currentFolder = row;

    this.pickCorrectFolder(row, stepper);
  }

  /**
   * Go back to the 1st step and empty our arrays
   */
  backNavigation(): void {
    this.firstStep = false;

    this.parameterasyncName = [];
    this.currentFolder = "";
  }

  /**
   * Go back to the 2nd step
   */
  backToparameter(): void {
    this.secondStep = false;
    this.startTime!.reset();
    this.stopTime!.reset();
    this.countTime!.reset();
  }

  /**
   * Submit the form and move to the graphs page
   */
  onSubmit(): void {
    this.dataservice.changeQueries(
      this.archiveTelemetryForm.get(["start"])!.value,
      this.archiveTelemetryForm.get(["stop"])!.value,
      this.archiveTelemetryForm.get(["count"])!.value
    );
    this.sharedService.makeArchiveGraphPublish();
    setTimeout(() => {
      this.router.navigate(["/graphs"]);
    }, 150);
  }

  /**
   * Pick the correct folder from the table in order to display its parameters and go to the next step
   *
   * @param row - the folder that was picked
   * @param stepper - the stepper that we use to move to the next step
   */
  pickCorrectFolder(row: any, stepper: MatStepper): void {
    /**
     * we pick the folder from logRowData and we populate our variables with the correct telemetries
     * we tell the app to detect the changes that we've made in order to see that the 1st step is true now
     */

    this.parameterasyncName = [];
    this.firstStep = true;
    this.cdRef.detectChanges(); // trigger the change detection manually to apply the completed state to the first step, which allows the stepper to move to the next step

    for (let i = 0; i < this.parameterasync.length; i++) {
      if (this.parameterasync[i] == undefined) {
        //temporary solution
        console.log("Undefined archive parameter file located.");
      } else if (
        this.parameterasync[i].qualifiedName.includes("/" + row + "/")
      ) {
        this.parameterasyncName = this.parameterasyncName.concat(
          this.parameterasync[i]
        );
      }
    }
    console.log(this.parameterasyncName);
    /**
     * the table data source is used for the search field in the 2nd step */
    this.tableDataSource = new MatTableDataSource(this.parameterasyncName);
    console.log(this.parameterasyncName); //parameterasyncName
    /**
     * we tell the stepper to move (first step is true now)
     */
    stepper.next();
  }

  isYamcs(folder: string): boolean {
    /**
     * checks if the folder we have picked is the Yamcs one
     * this is still under contruction due to errors with the type of some telemetries in this folder
     */
    if (folder == "yamcs") {
      return true;
    } else {
      return false;
    }
  }

  applyFilter(event: Event): void {
    /**
     * this is the filter for the search input in the 2nd step
     */
    const filterValue = (event.target as HTMLInputElement).value;
    this.tableDataSource.filter = filterValue.trim().toLowerCase();
  }

  changeToCorrectTime(): void {
    /**
     * we implement some window alerts in order for the user to know why theres been an error with the time or count values that he enters
     * also we patch our values to become JSON strings
     */

    this.archiveTelemetryForm
      .get("start")!
      .patchValue(
        JSON.stringify(this.archiveTelemetryForm.get("start")!.value)
      );
    this.startedit = this.archiveTelemetryForm.get("start")!.value;
    this.startedit = this.startedit.replace(/"/g, ""); // The "g" represents the "global modifier". This means that the replace will replace all copies of the matched string with the replacement string you provide.
    this.archiveTelemetryForm.get("start")!.patchValue(this.startedit);

    this.archiveTelemetryForm
      .get("stop")!
      .patchValue(JSON.stringify(this.archiveTelemetryForm.get("stop")!.value));
    this.stopedit = this.archiveTelemetryForm.get("stop")!.value;
    this.stopedit = this.stopedit.replace(/"/g, "");
    this.archiveTelemetryForm.get("stop")!.patchValue(this.stopedit);
  }

  backToTime(): void {
    /**
     * this function is called when we go back to the 3rd step
     */
    this.archiveTelemetryForm.get("start")!.reset();
    this.archiveTelemetryForm.get("stop")!.reset();
    this.archiveTelemetryForm.get("count")!.reset();
  }

  openSnackBar(message: string, action: string | undefined): void {
    /**
     * this is the help button in the 3rd step
     */
    this.snackBar.open(message, action, {
      duration: 5000,
      panelClass: "black-snackbar", // color of snackbar
    });
  }

  get startTime() {
    return this.archiveTelemetryForm.get("start");
  }

  get stopTime() {
    return this.archiveTelemetryForm.get("stop");
  }

  get countTime() {
    return this.archiveTelemetryForm.get("count");
  }

  // closePicker() {
  //   this.picker.cancel();
  // }
}
