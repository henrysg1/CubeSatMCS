import { Component, HostListener, OnInit } from "@angular/core";
import { lastValueFrom } from "rxjs";
import { archiveData } from "src/app/Interfaces/GraphData";
import { DataserviceService } from "src/app/services/dataservice.service";
import { HttpService } from "src/app/services/http.service";
import { SharedgraphserviceService } from "src/app/services/sharedgraphservice.service";
import { TelemetryService } from "src/app/services/telemetry.service";
import {
  EnumValue,
  ParameterInfo,
} from "src/app/Interfaces/ListParameterResponse";
import { Ranges } from "src/app/Interfaces/Ranges";
import { archiveGraphNames } from "src/app/Interfaces/GraphData";
@Component({
  selector: "app-archive-graph",
  templateUrl: "./archive-graph.component.html",
  styleUrls: ["./archive-graph.component.css"],
})
export class ArchiveGraphComponent implements OnInit {
  archiveData: any[] = archiveData;
  start: string = "";
  stop: string = "";
  count: string = "";

  innerWidth: any;
  view2: [number, number] = [0, 0];
  view1: [number, number] = [0, 0];

  results: any[] = [];
  scheme: string = "neons";
  timeline: boolean = true;
  parameterName: string = "";
  title: string = "";

  parameterEnum!: ParameterInfo;
  enumValues: EnumValue[] = [];
  folderCol: string[] = ["name", "value"];
  parameterType: string = "";

  instanceName!: string;
  ranges!: Ranges;
  constructor(
    private http: HttpService,
    private dataservice: DataserviceService,
    private sharedService: SharedgraphserviceService,
    private telemetryService: TelemetryService
  ) {}

  async ngOnInit(): Promise<void> {
    this.telemetryService.currentTelemetryVal.subscribe(
      (message) => (this.parameterName = message)
    );

    let tempData = {
      name: new Date(),
      value: 0,
    };
    this.dataservice.currentStart.subscribe((start) => (this.start = start));
    this.dataservice.currentStop.subscribe((stop) => (this.stop = stop));
    this.dataservice.currentCount.subscribe((count) => (this.count = count));
    this.dataservice.currentName.subscribe(
      (name) => (this.parameterName = name)
    );

    this.telemetryService.telemetryValuesEnum(this.parameterName);
    this.parameterEnum = await lastValueFrom(
      this.telemetryService.getParameterEnumTypes()
    );

    this.parameterType = this.parameterEnum.type.engType;
    archiveData[0].series = [];
    if (this.parameterType == "enumeration") {
      this.enumValues = this.parameterEnum.type.enumValue;
      this.dataservice.checkEnumMap(this.enumValues);

      this.ranges = await lastValueFrom(
        this.http.getArchivedEnumSamples(
          this.parameterName,
          this.start,
          this.stop
        )
      );

      for (let i = 0; i < this.ranges.range.length; i++) {
        if (this.ranges.range[i].engValues[0].stringValue == "UNDEF") continue;
        const rangesData = {
          name: new Date(this.ranges.range[i].start),
          value: this.dataservice.enumaratedMap.get(
            this.ranges.range[i].engValues[0].stringValue
          ),
        };
        archiveData[0].series.push(rangesData);
        if (i == this.ranges.range.length - 1) {
          const rangesData2 = {
            name: new Date(this.ranges.range[i].stop),
            value: this.dataservice.enumaratedMap.get(
              this.ranges.range[i].engValues[0].stringValue
            ),
          };
          archiveData[0].series.push(rangesData2);
        }
      }
    } else {
      await lastValueFrom(
        this.http.getSamples(
          this.parameterName,
          this.start,
          this.stop,
          this.count
        )
      ).then((samples) => (this.results = samples.sample));
      let value;
      for (let i = 0; i < this.results.length; i++) {
        value = 0;
        if (i == 0 || this.results[i].n != 0) {
          value = this.results[i].avg;
        }
        tempData = {
          name: new Date(this.results[i].time),
          value: value,
        };
        archiveData[0].series.push(tempData);
      }
    }
    archiveGraphNames.push(this.parameterName.replace(/ *\/[^/]*\/ */g, ""));
    this.title = archiveGraphNames[archiveGraphNames.length - 1];
    /* this should be used only if we want to update the enumValues with the new request (not applicable to charts) */

    // this.dataservice.currentEnumVal.subscribe((message) => {
    //   this.enumValues = message;
    // });
    this.archiveData = [...archiveData];
    this.results = this.archiveData;
    this.archiveData[0].name = this.title;
    archiveData[0].name = this.title;
    this.innerWidth = window.innerWidth;
    this.innerWidth = this.innerWidth;
    this.view2 = [this.innerWidth / 2, 400];
    this.view1 = [this.innerWidth, 400];
  }

  @HostListener("window:resize", ["$event"])
  onWindowResize() {
    this.innerWidth = window.innerWidth;
    this.innerWidth = this.innerWidth;
    this.view2 = [this.innerWidth / 2, 400];
    this.view1 = [this.innerWidth, 400];
  }

  /**
   * Removes the graph from the dashboard
   *
   * @param type - the type of the graph to be removed
   */
  removeWidget(type: string): void {
    this.sharedService.sendArchiveGraphClickEvent(type);
  }
}
