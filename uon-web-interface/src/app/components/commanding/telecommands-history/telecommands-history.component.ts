import { literalMap } from "@angular/compiler";
import { Component, OnInit } from "@angular/core";
import { CommandHistoryAttribute } from "src/app/Interfaces/TcHistory";
import { DataserviceService } from "src/app/services/dataservice.service";

@Component({
  selector: "app-telecommands-history",
  templateUrl: "./telecommands-history.component.html",
  styleUrls: ["./telecommands-history.component.css"],
})
export class TelecommandsHistoryComponent implements OnInit {
  commandHistoryTable!: Array<CommandHistoryAttribute[]>;
  tcVerifierHistoryTable!: Array<CommandHistoryAttribute[]>;
  tcNameArray!: string[];
  tcAssigmentArray!: Array<any[]>;
  tcIdArray!: string[];
  tcTimeArray!: Date[];

  constructor(private dataService: DataserviceService) {}

  ngOnInit(): void {
    this.dataService.currentTcStatusHistoryArray.subscribe(
      (Table) => (this.commandHistoryTable = Table)
    );

    this.dataService.currentTcVerifierHistoryArray.subscribe(
      (Table) => (this.tcVerifierHistoryTable = Table)
    );

    this.dataService.tcNameArray.subscribe((Name) => (this.tcNameArray = Name));

    this.dataService.tcAssigmentArray.subscribe(
      (Table) => (this.tcAssigmentArray = Table)
    );

    this.dataService.tcIdArray.subscribe((id) => (this.tcIdArray = id));

    this.dataService.tcTimeArray.subscribe((time) => (this.tcTimeArray = time));
  }

  getValue(assignment: any): any {
    return Object.values(assignment.value)[1];
  }
}
