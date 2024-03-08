import { Component, OnInit } from "@angular/core";
import { InstanceHandlerService } from "src/app/services/instance-handler.service";
import { DataserviceService } from "src/app/services/dataservice.service";
import { TelemetryComponent } from "../telemetry/telemetry.component";
import { HttpService } from "src/app/services/http.service";
import { lastValueFrom } from "rxjs";
import { ListInstancesResponse } from "src/app/Interfaces/instances";
@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.css"],
})
export class HeaderComponent implements OnInit {
  instance!: string;
  utcTime!: Date;
  instances!: ListInstancesResponse;

  constructor(
    private instanceHandlerService: InstanceHandlerService,
    private dataService: DataserviceService,
    private httpService: HttpService
  ) {}

  async ngOnInit(): Promise<void> {
    this.instanceHandlerService
      .getInstance()
      .subscribe((instance) => (this.instance = instance));

    this.dataService.currentUTCTime.subscribe((time) => {
      this.utcTime = time;
    });

    this.instances = await lastValueFrom(this.httpService.getInstances());
  }

  // renders the correct name in the div tag
  name: string = "Spacecraft Operations";

  getName(): string {
    if (!this.name) {
      this.name = "username";
    }
    return this.name;
  }

  onInstanceClick(instanceClick: string) {
    this.instanceHandlerService.updateInstance(instanceClick);
  }
}
