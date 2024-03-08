import { Component } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { NavigationEnd, Router } from "@angular/router";
import { NotificationService } from "./services/notification.service";
import { WebsocketService } from "./services/websocket.service";
import { InstanceHandlerService } from "./services/instance-handler.service";
import { DataserviceService } from "./services/dataservice.service";
import { HttpService } from "./services/http.service";
import { ListInstancesResponse } from "./Interfaces/instances";
import { lastValueFrom } from "rxjs";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent {
  homeUrl: boolean = true;
  graphsView!: boolean;
  time!: Date;
  utcTime!: Date;
  instances!:ListInstancesResponse;

  constructor(
    private wss: WebsocketService,
    private notificationService: NotificationService,
    private snackBar: MatSnackBar,
    private router: Router,
    private instanceHandlerService: InstanceHandlerService,
    private dataService: DataserviceService,
    private httpService: HttpService
  ) {
    this.notificationService.notification$.subscribe((message) => {
      this.snackBar.open(message, "OK", { duration: 3000 });
    });
    this.router.navigate([""]);
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        if (event.url == "/") {
          this.homeUrl = true;
        } else {
          this.homeUrl = false;
        }
      }
    });
  }

  async ngOnInit(): Promise<void> {
    this.dataService.currentgreekTime.subscribe((time) => {
      this.time = time;
    });
    this.dataService.currentUTCTime.subscribe((time) => {
      this.utcTime = time;
    });

    this.wss.newConnection();
    setInterval(() => {
      this.time = new Date();
      this.dataService.changeTime(this.time);
    }, 1000);
    this.instances= await lastValueFrom(this.httpService.getInstances());
  }

  onInstanceClick(instanceClick: string) {
    this.instanceHandlerService.updateInstance(instanceClick);
  }

}
