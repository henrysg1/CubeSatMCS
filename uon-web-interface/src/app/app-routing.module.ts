import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ArchiveTelemetryComponent } from "./components/graphing/archive-telemetry/archive-telemetry.component";
import { TelemetryComponent } from "./components/telemetry/telemetry.component";
import { TelecommandsComponent } from "./components/commanding/telecommands/telecommands.component";
import { TelecommandsHistoryComponent } from "./components/commanding/telecommands-history/telecommands-history.component";
import { GraphsComponent } from "./components/graphing/graphs/graphs.component";
import { BucketsComponent } from "./components/buckets/buckets.component";
import { ParametersComponent } from "./components/parameters/parameters.component";
import { TelecommandItemComponent } from "./components/commanding/telecommand-item/telecommand-item.component";
import { TelecommandResponseComponent } from "./components/commanding/telecommand-response/telecommand-response.component";

const appRoutes: Routes = [
  {
    path: "",
    pathMatch: "full",
    redirectTo: "",
  },
  { path: "parameters", component: ParametersComponent },
  { path: "telemetry-table", component: TelemetryComponent },
  { path: "archive-telemetry", component: ArchiveTelemetryComponent },
  { path: "graphs", component: GraphsComponent },
  {
    path: "telecommands",
    component: TelecommandsComponent,
    children: [
      {
        path: ":telecommand",
        component: TelecommandItemComponent,
        children: [
          { path: ":response-id", component: TelecommandResponseComponent },
        ],
      },
    ],
  },
  { path: "buckets", component: BucketsComponent },
  { path: "telecommand-history", component: TelecommandsHistoryComponent },
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
export const routingComponents = [];
