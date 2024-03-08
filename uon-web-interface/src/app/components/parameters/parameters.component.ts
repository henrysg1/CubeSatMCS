import { Component } from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { Router } from "@angular/router";
import { lastValueFrom } from "rxjs/internal/lastValueFrom";
import { createdRealTimeGraphsInstanceAndQualifiedNames } from "src/app/Interfaces/GraphData";
import {
  ListParametersResponse,
  ParameterInfo,
} from "src/app/Interfaces/ListParameterResponse";
import { HttpService } from "src/app/services/http.service";
import { InstanceHandlerService } from "src/app/services/instance-handler.service";
import { NotificationService } from "src/app/services/notification.service";
import { SharedgraphserviceService } from "src/app/services/sharedgraphservice.service";
import { WebsocketService } from "src/app/services/websocket.service";

@Component({
  selector: "app-parameters",
  templateUrl: "./parameters.component.html",
  styleUrls: ["./parameters.component.css"],
})
export class ParametersComponent {
  parametersList!: ListParametersResponse; // includes a list of all parameters (maybe make this a globabal variable)
  displayedCol: string[] = ["Parameter Names", "Parameter Types"];
  tableDataSource!: MatTableDataSource<ParameterInfo>;
  yamcsInstanceName: string = "OBC";

  constructor(
    private instanceHandler: InstanceHandlerService,
    private httpService: HttpService,
    private wss: WebsocketService,
    private sharedService: SharedgraphserviceService,
    private notifService: NotificationService,
    private router: Router
  ) {
    this.instanceHandler
      .getInstance()
      .subscribe((instanceName) => (this.yamcsInstanceName = instanceName));
  }

  async ngOnInit(): Promise<void> {
    this.parametersList = await lastValueFrom(this.httpService.getParameters());
    this.parametersList.parameters = this.parametersList.parameters.filter(
      (param) => param.hasOwnProperty("type")
    );
    this.tableDataSource = new MatTableDataSource(
      this.parametersList.parameters
    );
  }

  /**
   * Checks if the graph of a specific parameter is created, by checking if its qualified name and instance
   * exists in the createdRealTimeGraphsQualifiedNames array.
   *
   * If it isn't, we are requesting a wss call to yamcs and also creating the graph,
   * by publishing a click event to the add-graph.directive,
   * which is responsible for the creation of the graph.
   *
   * If it is, we are displaying a notification to the user, saying that the graph
   * already exists.
   *
   * @param qualifiedName the qualified name of the parameter we're requesting
   */

  addGraph(qualifiedName: string): void {
    if (
      !createdRealTimeGraphsInstanceAndQualifiedNames.includes(
        this.yamcsInstanceName + qualifiedName
      )
    ) {
      this.wss.newParameterRequest(qualifiedName);
      this.sharedService.makeGraphPublish(qualifiedName);
      this.router.navigate(["graphs"]);
    } else {
      this.notifService.notification$.next("Graph already exists");
    }
  }

  applyFilter(event: Event): void {
    const filteredValue = (event.target as HTMLInputElement).value;
    this.tableDataSource.filter = filteredValue.trim().toLowerCase();
  }
}
