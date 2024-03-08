import { Component, HostListener, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { callMatchingMap, ngxData } from "src/app/Interfaces/GraphData";
import { SharedgraphserviceService } from 'src/app/services/sharedgraphservice.service';
import { graphData } from "src/app/Interfaces/GraphData";

@Component({
  selector: 'app-graph-item',
  templateUrl: './graph-item.component.html',
  styleUrls: ['./graph-item.component.css']
})

export class GraphItemComponent implements OnInit{
  results: ngxData = {
    data: [
      {
        name: "Value",
        type: "",
        series: [{name: new Date(0), value: 0}]
      }
    ]
  }
  qualifiedName: string=''; //getting set in the directive which receives it from the sidenav
  instanceName: string = '';
  parameterName: string = '';
  isOfType!: boolean;
  subscription: Subscription | undefined;
  innerWidth: any;
  view2: [number,number] = [0,0];
  view1: [number, number] = [0,0];
  scheme: string = 'neons';
  timeline: boolean = true;
  currentValue: any;

  constructor(private sharedService: SharedgraphserviceService) { 
    this.results.data[0].series.length = 0; //setting this equal to 0 to avoid a starting 0 value
    /*
     * Subscribes to the graphData which is being updated by the websocket. 
     * Checks if the qualified name, which is set in the add-graph.directive
     * based on the parameter that's clicked in the sidenav, is equal to the call's
     * qualified name (check callMatchingMap in the websocketservice). If 
     * it is we update the data of this real-time-graph
     */
    this.subscription = graphData.subscribe(data => {
        if(this.qualifiedName == callMatchingMap.get(data.call)){
          this.isOfType = data.isOfType;
          this.results.data[0].series.push(data.value);
          this.results.data = [...this.results.data];
          this.currentValue = data.value.value;
        }
      });
  }

  /**
   * Extracts the parameterName, using the parameter's qualified name and
   * removing the file name.
   * Sets the appropriate sizing of the component
   */
  ngOnInit(): void {
    this.parameterName = this.qualifiedName.replace(/ *\/[^/]*\/ */g, "");
    this.results.data[0].name = this.parameterName;
    this.results.data[0].type = <string>this.qualifiedName.match(/ *\/[^/]*\/ */g)?.toString(); //file's name
    this.innerWidth = window.innerWidth;
    this.innerWidth = this.innerWidth - 250;
    this.view2 = [this.innerWidth/2, 400];
    this.view1 = [this.innerWidth, 400];
  }

  /**
   * Fired on resize events.
   * Resizes the component accordingly.
   */
 
  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    this.innerWidth = window.innerWidth;
    //this.innerWidth = (this.innerWidth - 300);
    this.view2 = [this.innerWidth/2, 400];
    this.view1 = [this.innerWidth, 400];
  }


/**
 * Sends a message to the add-graph.directive in order
 * to remove the viewRef of the component, by searching
 * for its index, inside a qualifiedNames array. 
 * 
 * @param qualifiedName the parameter's qualified name
 * 
 */

  removeWidget(qualifiedName: string):void{
    this.sharedService.sendGraphClickEvent(this.instanceName + qualifiedName);
  }

}
