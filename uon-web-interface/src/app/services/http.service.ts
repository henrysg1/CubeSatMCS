import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { TimeSeries } from "../Interfaces/ArchiveParameters";
import { ListParametersResponse } from "../Interfaces/ListParameterResponse";
import { Ranges } from "../Interfaces/Ranges";
import { CommandHistoryEntry } from "../Interfaces/TcHistory";

import { yamcsBaseUrl } from "../Interfaces/GraphData";
import { InstanceHandlerService } from "./instance-handler.service";
import { ListCommandsResponse } from "../Interfaces/Telecommands";
import { ListInstancesResponse } from "../Interfaces/instances";
@Injectable({
  providedIn: "root",
})

/**
 * Responsible for sending http requests to yamcs
 */
export class HttpService {
  yamcsInstanceName: string = "OBC"; //default yamcs instance is OBC
  apiUrl = `${yamcsBaseUrl}/mdb/${this.yamcsInstanceName}/parameters/?limit=140`;
  archiveUrl = `${yamcsBaseUrl}/archive/${this.yamcsInstanceName}/parameters`;

  commandsUrl: string = `${yamcsBaseUrl}/mdb/${this.yamcsInstanceName}/commands`; //add ?noAbstract to get the Tcs we can send

  constructor(
    private http: HttpClient,
    private instanceHandler: InstanceHandlerService
  ) {
    this.instanceHandler
      .getInstance()
      .subscribe((instanceName) => (this.yamcsInstanceName = instanceName));
  }

  getInstances(): Observable<ListInstancesResponse> {
    return this.http.get<ListInstancesResponse>(`${yamcsBaseUrl}/instances`);
  }

  getCommands(): Observable<ListCommandsResponse> {
    return this.http.get<ListCommandsResponse>(this.commandsUrl);
  }

  getTcResponse(id: string, instance: string): Observable<CommandHistoryEntry> {
    return this.http.get<CommandHistoryEntry>(
      `${yamcsBaseUrl}/archive/${instance}/commands/${id}`
    );
  }

  /***
   *
   * @returns an observable of the list of the parameters that yamcs contains
   */

  getParameters(): Observable<ListParametersResponse> {
    return this.http.get<ListParametersResponse>(this.apiUrl);
  }

  /**
   * @parameterName = the parameter's qualifiedName
   * @start = the time we want to start getting the samples
   * @stop = the stop time we want to stop getting the samples
   * @count = number of intervals to use, default is 500
   * @returns the samples of a specific parameter as an observable if that parameter is not an enumeration,
   * because enums do not have samples
   */

  getSamples(
    parameterName: string,
    start: string,
    stop: string,
    count: string
  ): Observable<TimeSeries> {
    let url =
      this.archiveUrl +
      parameterName +
      "/samples?" +
      "start=" +
      start +
      "&" +
      "stop=" +
      stop +
      "&" +
      "count=" +
      count;
    return this.http.get<TimeSeries>(url);
  }

  /**
    @parameterName = the parameter's qualifiedName
    @start = the time we want to start getting the samples
    @stop = the stop time we want to stop getting the samples
    @returns the ranges of a specific parameter if that parameter is an enumeration
    */

  getArchivedEnumSamples(
    parameterName: string,
    start: string,
    stop: string
  ): Observable<Ranges> {
    let url = this.archiveUrl.concat(
      parameterName,
      "/ranges?",
      "start=",
      start,
      "&" + "stop=",
      stop
    );
    return this.http.get<Ranges>(url);
  }
  getInstance(): string {
    return this.yamcsInstanceName;
  }
}
