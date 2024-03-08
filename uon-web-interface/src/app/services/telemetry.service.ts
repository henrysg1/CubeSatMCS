import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, lastValueFrom } from "rxjs";
import { TimeSeries } from "../Interfaces/ArchiveParameters";
import {
  ListParametersResponse,
  ParameterInfo,
} from "../Interfaces/ListParameterResponse";
import { ListParameterHistoryResponse } from "../Interfaces/ParameterHistory";
import { InstanceHandlerService } from "./instance-handler.service";
import { yamcsBaseUrl } from "../Interfaces/GraphData";
import { ListSpaceSystemsResponse } from "../Interfaces/ListSpaceSystemsResponse";

@Injectable({
  providedIn: "root",
})
export class TelemetryService {
  private sampleSource = new BehaviorSubject<string>("");
  currentSample = this.sampleSource.asObservable();
  yamcsInstanceName: string = "OBC";
  private telemetryValSource = new BehaviorSubject<string>("");
  currentTelemetryVal = this.telemetryValSource.asObservable();

  apiUrl = new BehaviorSubject<string>(
    `${yamcsBaseUrl}/mdb/${this.yamcsInstanceName}/parameters`
  );
  currentApiUrl = this.apiUrl.asObservable();

  private historyUrl = "";
  private samplesUrl = "";

  foldersUrl = new BehaviorSubject<string>(
    `${yamcsBaseUrl}/mdb/${this.yamcsInstanceName}/space-systems`
  );

  private yamcsUrl = `${this.apiUrl}/?q=yamcs`;

  private telemetryEnum = "";

  constructor(
    private http: HttpClient,
    private instanceHandler: InstanceHandlerService
  ) {
    this.instanceHandler
      .getInstance()
      .subscribe((instanceName) => (this.yamcsInstanceName = instanceName));
  }

  async getFoldersResponse(): Promise<string[]> {
    let newfoldersUrl = `${yamcsBaseUrl}/mdb/${this.yamcsInstanceName}/space-systems`;
    this.foldersUrl.next(newfoldersUrl);
    console.log(this.foldersUrl);
    let spaceSystems = await lastValueFrom(
      this.http.get<ListSpaceSystemsResponse>(this.foldersUrl.value)
    );
    let folders: string[] = [];
    spaceSystems.spaceSystems.forEach((spaceSystem) =>
      folders.push(spaceSystem.name)
    );
    return folders;
  }

  getTelemetryResponse(): Observable<ListParametersResponse> {
    let newUrl = `${yamcsBaseUrl}/mdb/${this.yamcsInstanceName}/parameters`;
    this.apiUrl.next(newUrl);
    return this.http.get<ListParametersResponse>(this.apiUrl.value);
  }

  getSamplesValueResponse(): Observable<TimeSeries> {
    return this.http.get<TimeSeries>(this.samplesUrl);
  }

  getHistoryValueResponse(): Observable<ListParameterHistoryResponse> {
    return this.http.get<ListParameterHistoryResponse>(this.historyUrl);
  }

  changeSample(message: string): void {
    this.sampleSource.next(message);
    this.samplesUrl = "";
    this.historyUrl = "";
    this.sampleSource.subscribe((data) => {
      //"http://localhost:8090/api/archive/AcubeSAT/parameterss",
      this.samplesUrl = this.samplesUrl.concat(
        yamcsBaseUrl,
        "/archive/",
        this.yamcsInstanceName,
        "/parameters",
        data,
        "/samples"
      );

      this.historyUrl = this.historyUrl.concat(
        yamcsBaseUrl,
        "/archive/",
        this.yamcsInstanceName,
        "/parameters",
        data
      );
    });
    console.log(this.samplesUrl);
  }

  telemetryValuesEnum(message: string): void {
    this.telemetryValSource.next(message);
    this.telemetryEnum = "";
    this.telemetryValSource.subscribe((data) => {
      // "http://localhost:8090/api/mdb/AcubeSAT
      this.telemetryEnum = this.telemetryEnum.concat(
        yamcsBaseUrl,
        "/mdb/",
        this.yamcsInstanceName,
        "/parameters",
        data
      );
    });
  }

  getParameterEnumTypes(): Observable<ParameterInfo> {
    return this.http.get<ParameterInfo>(this.telemetryEnum);
  }
}
