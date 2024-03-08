import { Component } from "@angular/core";
import { WebsocketService } from "../../../services/websocket.service";

@Component({
  selector: "app-graphs",
  templateUrl: "graphs.component.html",
  styleUrls: ["./graphs.component.css"],
})
export class GraphsComponent {
  constructor(private wss: WebsocketService) {
    this.wss.listen();
  }
}
