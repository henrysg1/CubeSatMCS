import { Component, OnInit } from "@angular/core";
import { lastValueFrom } from "rxjs";
import { HttpService } from "src/app/services/http.service";
import {
  CommandHistoryAttribute,
  CommandHistoryEntry,
} from "src/app/Interfaces/TcHistory";
import { TelecommandsComponent } from "../telecommands/telecommands.component";
import { DataserviceService } from "src/app/services/dataservice.service";
import { CustomTelecommandResponse } from "src/app/Interfaces/Telecommands";
import { ActivatedRoute } from "@angular/router";
import { InstanceHandlerService } from "src/app/services/instance-handler.service";

@Component({
  selector: "app-telecommand-response",
  templateUrl: "./telecommand-response.component.html",
  styleUrls: ["./telecommand-response.component.css"],
})
export class TelecommandResponseComponent implements OnInit {
  yamcsInstanceName!: string;
  response!: any;
  tcStatus!: CommandHistoryEntry;
  tcStatusArray: CommandHistoryAttribute[] = [];
  tcVerifierArray: CommandHistoryAttribute[] = [];
  commandHistoryTable!: Array<CommandHistoryAttribute[]>;
  timer: number = 0;

  constructor(
    private httpService: HttpService,
    private telecommands: TelecommandsComponent,
    private dataService: DataserviceService,
    private activatedRoute: ActivatedRoute,
    private instanceHandler: InstanceHandlerService
  ) {
    this.instanceHandler
      .getInstance()
      .subscribe((instance) => (this.yamcsInstanceName = instance));
    this.activatedRoute.params.subscribe((params) => {
      this.response = params["response-id"];
    });
  }

  async ngOnInit(): Promise<void> {
    for (let i = 0; i <= 3; i++) {
      setTimeout(() => this.reloadData(), 5000 * i);
    }

    this.dataService.currentTcStatusHistoryArray.subscribe(
      (Table) => (this.commandHistoryTable = Table)
    );
  }

  async reloadData(): Promise<void> {
    this.tcStatus = await lastValueFrom(
      this.httpService.getTcResponse(this.response, this.yamcsInstanceName)
    );

    this.tcVerifierArray.length = 0;
    this.tcStatusArray.length = 0;
    for (let i = 0; i < this.tcStatus.attr.length; i++) {
      if (
        this.tcStatus.attr[i].name.startsWith("Verifier") &&
        this.tcStatus.attr[i].name.endsWith("Status")
      ) {
        this.tcVerifierArray.push(this.tcStatus.attr[i]);
      } else if (
        this.tcStatus.attr[i].name.startsWith("Acknowledge") &&
        this.tcStatus.attr[i].name.endsWith("Status")
      ) {
        this.tcStatusArray.push(this.tcStatus.attr[i]);
      }
    }
    this.timer += 1;
    if (this.timer == 4) {
      this.dataService.changeCommandTable(
        this.tcStatusArray,
        this.tcVerifierArray,
        this.tcStatus.commandName,
        this.tcStatus.assignments,
        new Date(this.tcStatus.generationTime),
        this.tcStatus.id
      );
      this.timer = 0;
    }
  }

  getValue(assignment: any): any {
    return Object.values(assignment.value)[1];
  }
}
