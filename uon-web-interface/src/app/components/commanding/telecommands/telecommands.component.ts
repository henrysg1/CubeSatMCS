import { Component, OnInit } from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { lastValueFrom } from "rxjs";
import {
  CommandInfo,
  ListCommandsResponse,
  globalTelecommandsArray,
} from "src/app/Interfaces/Telecommands";
import { DataserviceService } from "src/app/services/dataservice.service";
import { HttpService } from "src/app/services/http.service";

@Component({
  selector: "app-telecommands",
  templateUrl: "./telecommands.component.html",
  styleUrls: ["./telecommands.component.css"],
})
export class TelecommandsComponent implements OnInit {
  telecommandsArray: CommandInfo[] = [];
  telecommandsList!: ListCommandsResponse;
  displayedCol: string[] = ["telecommands"];
  tableDataSource!: MatTableDataSource<CommandInfo>;

  constructor(private httpService: HttpService) {}

  async ngOnInit(): Promise<void> {
    this.telecommandsList = await lastValueFrom(this.httpService.getCommands());
    for (let i = 0; i < this.telecommandsList.commands.length; i++) {
      if (!this.telecommandsList.commands[i].abstract) {
        this.telecommandsArray.push(this.telecommandsList.commands[i]);
      }
      globalTelecommandsArray.push(this.telecommandsList.commands[i]);
    }
    this.tableDataSource = new MatTableDataSource(this.telecommandsArray);
  }

  applyFilter(event: Event): void {
    const filteredValue = (event.target as HTMLInputElement).value;
    this.tableDataSource.filter = filteredValue.trim().toLowerCase();
  }

  onViewChange(): void {
    let container = document.querySelector(".container");
    container?.classList.toggle("view-change");
  }
}
