import { Component, OnInit, ViewChild } from "@angular/core";
import { ParameterInfo } from "src/app/Interfaces/ListParameterResponse";
import { TelemetryService } from "src/app/services/telemetry.service";
import { MatPaginator } from "@angular/material/paginator";
import { WebsocketService } from "src/app/services/websocket.service";
import { lastValueFrom, Subscription } from "rxjs";
import { callMatchingMap, graphData } from "src/app/Interfaces/GraphData";
import { ngxData } from "src/app/Interfaces/GraphData";
import { DataserviceService } from "src/app/services/dataservice.service";
import { HttpService } from 'src/app/services/http.service';
import { ListParametersResponse } from "src/app/Interfaces/ListParameterResponse";
import { InstanceHandlerService } from "src/app/services/instance-handler.service";
@Component({
  selector: "app-telemetry",
  templateUrl: "./telemetry.component.html",
  styleUrls: ["./telemetry.component.css"],
})
export class TelemetryComponent implements OnInit {
  instance!:string;
  public parameterInfoRealTime: ngxData[] = [{
    data: [
      { 
          type: "Value",
          name: "Value",
          series: [{name: new Date(0), value: 0}],
      }
    ]
  }];
  parametersDisplayed: string[] = [];
  public parameterInfoName: string[] = [];
  public displayedCol: string[] = ["telemetry", "type", "value"];
  subscription: Subscription | undefined;
  qualifiedParameterNames: string[] = [];
  parametersList!: ListParametersResponse;

  constructor(private wss: WebsocketService, private httpService: HttpService, private IntanceHandler:InstanceHandlerService) {
    this.IntanceHandler.instance.subscribe(instance =>{this.instance=instance
      this.ngOnInit();});
  }


  async ngOnInit(): Promise<void> {
    this.parametersList = await lastValueFrom(this.httpService.getParameters());
    console.log(this.instance);
    for(let i = 0; i < this.parametersList.parameters.length; i++){
      this.qualifiedParameterNames[i] = this.parametersList.parameters[i].qualifiedName;
      this.wss.newParameterRequest(this.qualifiedParameterNames[i]);
      
    }
    this.parameterInfoRealTime.length = 0;
    this.wss.listen();
    this.subscription = graphData.subscribe(data => {
      let i = 0;
      while(i < this.parametersList.parameters.length){
        if(this.qualifiedParameterNames[i] == callMatchingMap.get(data.call)){
          //if parameter is not displayed, add it to the array, and add name to displayed parameters
          if(!this.parametersDisplayed.includes(this.qualifiedParameterNames[i])){
            let tempData: ngxData = {
              data: [{
                  name: data.name,
                  type: data.type,
                  series: [data.value]
              }]
            }
            this.parameterInfoRealTime.push(tempData);
            this.parameterInfoRealTime = [...this.parameterInfoRealTime];
            this.parametersDisplayed.push(this.qualifiedParameterNames[i]);
          }
          else{
            let filteredData = this.parameterInfoRealTime.filter(parameter => parameter.data[0].name == data.name);
            if (filteredData.length > 0) {
              let index = this.parametersDisplayed.indexOf(filteredData[0].data[0].name);
              this.parameterInfoRealTime[index].data[0].series[0].value = data.value.value;
              this.parameterInfoRealTime[index].data[0].series = [...this.parameterInfoRealTime[index].data[0].series];
            }
          }
          break;
        }
        i++;
      }
    });
  }

  /**
   * Filters the telemetry data  based on the input of the search bar.
   * 
   * @param event = The event that triggered the filter
   * @returns void
   */
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    const filteredData = this.parameterInfoRealTime.filter(data => data.data[0].name.toLowerCase().includes(filterValue));
    const filteredparametersDisplayed = this.parametersDisplayed.filter(data => data.toLowerCase().includes(filterValue));
    this.parameterInfoRealTime = filteredData;
    this.parametersDisplayed = filteredparametersDisplayed;
  }

  /**
   * Updates the telemetry data.
   * 
   * @returns void
   */
  async updateTelemtry(): Promise<void>{
    this.parametersList = await lastValueFrom(this.httpService.getParameters());
    console.log(this.httpService.getInstance());
    for(let i = 0; i < this.parametersList.parameters.length; i++){
      this.qualifiedParameterNames[i] = this.parametersList.parameters[i].qualifiedName;
      this.wss.newParameterRequest(this.qualifiedParameterNames[i]);
      
    }
    this.parameterInfoRealTime.length = 0;
    this.wss.listen();
    this.subscription = graphData.subscribe(data => {
      let i = 0;
      while(i < this.parametersList.parameters.length){
        if(this.qualifiedParameterNames[i] == callMatchingMap.get(data.call)){
          //if parameter is not displayed, add it to the array, and add name to dispayed parameters
          if(!this.parametersDisplayed.includes(this.qualifiedParameterNames[i])){
            let tempData: ngxData = {
              data: [{
                  name: data.name,
                  type: data.type,
                  series: [data.value]
              }]
            }
            this.parameterInfoRealTime.push(tempData);
            this.parameterInfoRealTime = [...this.parameterInfoRealTime];
            this.parametersDisplayed.push(this.qualifiedParameterNames[i]);
          }
          else{
            let filteredData = this.parameterInfoRealTime.filter(parameter => parameter.data[0].name == data.name);
            if (filteredData.length > 0) {
              let index = this.parametersDisplayed.indexOf(filteredData[0].data[0].name);
              this.parameterInfoRealTime[index].data[0].series[0].value = data.value.value;
              this.parameterInfoRealTime[index].data[0].series = [...this.parameterInfoRealTime[index].data[0].series];
            }
          }
          break;
        }
        i++;
      }
    });

  }
}
