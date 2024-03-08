import { Injectable } from "@angular/core";
import {
  UpdateSeries,
  graphData,
  Series,
  callMatchingMap,
  calls,
} from "src/app/Interfaces/GraphData";
import { InstanceHandlerService } from "./instance-handler.service";

@Injectable({
  providedIn: "root",
})
export class WebsocketService {

  yamcsInstanceName: string = "OBC";
  socket!: WebSocket;
  id: number = 1;
  constructor(private instanceHandler: InstanceHandlerService) {
    this.instanceHandler.getInstance().subscribe((instanceName) => (this.yamcsInstanceName = instanceName));
  }

  /**
   * Establish WebSoket connection.
   */
  newConnection(): void {
    /**Creates a websocket connection */
    if (!this.socket) {
      this.socket = new WebSocket("ws://localhost:8090/api/websocket");
    }

    /**Connection opened*/
    this.socket.onopen = function () {
      console.log("Connection opened");
    };
  }

  /**
   * New parameter request to specified parameter name.
   *
   * @param parameterQualifiedName = The qualified name of the parameter used for the request
   */

  newParameterRequest(parameterQualifiedName: string): void {
    let parameterRequest = {
      type: "parameters",
      id: this.id,
      options: {
        instance: this.yamcsInstanceName,
        processor: "realtime",
        id: [{ name: parameterQualifiedName }],
      },
    };

    this.id++;

    if (this.socket.readyState == 1) {
      this.socket.send(JSON.stringify(parameterRequest));
      console.log("Sent parameter request");
    } else {
      console.log("WebSocket not connected");
    }
  }

  /**
   * Listens to the websocket connection for messages and parses the data.
   */
  listen(): void {
    var time: string;
    var callNumber: number = 0
    /**
     * The message event is fired when data is received through a WebSocket.
     */
    this.socket.onmessage = function (event) {
      var yamcsReply = JSON.parse(event.data);
      if (yamcsReply.type == "parameters") {
        /**
         * Checks if the call exists in the map.
         * If it doesn't, we add it, if it does, we don't.
         */
          if(yamcsReply.seq == 1 && !callMatchingMap.has(yamcsReply.call)){
            callMatchingMap.set(yamcsReply.call, yamcsReply.data.mapping[1].name);
            callNumber++;
            calls.push(yamcsReply.call);
          }
          /**
           * Checks if the parameter we're requesting has real-time values.
           * If we don't do this check, there will be erros at line 95
           * since there won't be a yamcsReply.data.values[0].
           * If it has real-time values, we extract the data and publish 
           * it to the graph-item component. We're also checking if the 
           * parameter is of an appropriate type, meaning integer or float, 
           * in order to create an ngx line chart.
           */
          if(yamcsReply.data.hasOwnProperty("values")){
            var parameterName: string = <string>callMatchingMap.get(yamcsReply.call); //gets the param name from the map according to the call's number
            time = yamcsReply.data.values[0].generationTime; //keep in mind that we might need to convert this if yamcs uses its custom time
            let realTime = new Date(time);
            let engType = Object.keys(yamcsReply.data.values[0].engValue)[1];
            let value = yamcsReply.data.values[0].engValue[engType];
            let engineeringType = yamcsReply.data.values[0].engValue.type;
            let isOfType: boolean;
            if(engineeringType == "ARRAY" || engineeringType == "ENUMERATED" || engineeringType == "TIMESTAMP" || engineeringType == "STRING"){
              isOfType = false;
            }else{
              isOfType = true;
            }
            const series: Series = {
              name: realTime,
              value: value,
            };

            const currentData: UpdateSeries = {
              name: parameterName,
              call: yamcsReply.call,
              isOfType: isOfType,
              value: series,
              type : engineeringType,
            };

            graphData.next(currentData);
          }
      }
    };
  }

  cancelCall(index: number): void{
    let cancel = {
      "type": "cancel",
      "options":{
        "call": index
      }
    }
    this.socket.send(JSON.stringify(cancel));
  }

  /*
  errorHandler = (): Observable<Event> => {
    return new Observable(observer => {
      this.socket.onerror = (event: Event) => {
        console.log("An error has occured! : ", event);
        observer.next(event);
      };
    });
  };



  /** 
  close(): void{
    try{
      this.socket.close();
    } catch (error){
      console.log("Eror occured while attempting to terminate connection : " , error)
    }
  }
 */
}
