import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { AppComponent } from "./app.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MatExpansionModule } from "@angular/material/expansion";
import { HttpClientModule } from "@angular/common/http";
import { MaterialModule } from "./material/material.module";
import { HeaderComponent } from "./components/header/header.component";
import { SidenavComponent } from "./components/sidenav/sidenav.component";
import { MatSidenavModule } from "@angular/material/sidenav";
import { FormsModule } from "@angular/forms";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatGridListModule } from "@angular/material/grid-list";
import { GraphsComponent } from "./components/graphing/graphs/graphs.component";
import { NgxChartsModule } from "@swimlane/ngx-charts";
import { GraphItemComponent } from "./components/graphing/graph-item/graph-item.component";
import { HttpService } from "./services/http.service";
import { TelemetryComponent } from "./components/telemetry/telemetry.component";
import { RouteReuseStrategy, RouterModule, Routes } from "@angular/router";
import { ArchiveGraphComponent } from "./components/graphing/archive-graph/archive-graph.component";
import { ArchiveTelemetryComponent } from "./components/graphing/archive-telemetry/archive-telemetry.component";
import { ReactiveFormsModule } from "@angular/forms";

import {
  NgxMatDatetimePickerModule,
  NgxMatNativeDateModule,
} from "@angular-material-components/datetime-picker";
import { MatNativeDateModule } from "@angular/material/core";
import { MatDatepickerModule } from "@angular/material/datepicker";

import { AddGraphDirective } from "./components/graphing/graphs/add-graph.directive";
import { ArchiveGraphDirective } from "./components/graphing/graphs/archive-graph.directive";
import { CustomRouteReuseStrategy } from "./Routing/custom-route-reuse-strategy.service";
import { TelecommandsComponent } from "./components/commanding/telecommands/telecommands.component";
import { TelecommandItemComponent } from "./components/commanding/telecommand-item/telecommand-item.component";
import { TelecommandResponseComponent } from "./components/commanding/telecommand-response/telecommand-response.component";
import { MatTooltipModule } from "@angular/material/tooltip";
import { BucketsComponent } from "./components/buckets/buckets.component";
import { BucketItemComponent } from "./components/bucket-item/bucket-item.component";
import { BucketItemDialogComponent } from "./components/bucket-item-dialog/bucket-item-dialog.component";
import { BucketDialogComponent } from "./components/bucket-dialog/bucket-dialog.component";

import { TelecommandsHistoryComponent } from "./components/commanding/telecommands-history/telecommands-history.component";

// Import PrimeNG modules
import { ButtonModule } from "primeng/button";
import { FileUploadModule } from 'primeng/fileupload';
import { TooltipModule } from "primeng/tooltip";
import { ParametersComponent } from './components/parameters/parameters.component';
import { AppRoutingModule } from "./app-routing.module";

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    SidenavComponent,
    GraphsComponent,
    GraphItemComponent,
    TelemetryComponent,
    ArchiveGraphComponent,
    ArchiveTelemetryComponent,
    AddGraphDirective,
    ArchiveGraphDirective,
    TelecommandsComponent,
    TelecommandItemComponent,
    TelecommandResponseComponent,
    BucketsComponent,
    BucketItemComponent,
    BucketItemDialogComponent,
    BucketDialogComponent,
    TelecommandsHistoryComponent,
    ParametersComponent,
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MaterialModule,
    MatSidenavModule,
    FormsModule,
    BrowserModule,
    BrowserAnimationsModule,
    NgxChartsModule,
    HttpClientModule,
    MatExpansionModule,
    MatGridListModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    NgxMatDatetimePickerModule,
    MatNativeDateModule,
    MatDatepickerModule,
    NgxMatNativeDateModule,
    MatTooltipModule,
    ButtonModule,
    FileUploadModule,
    TooltipModule,
  ],
  providers: [
    GraphItemComponent,
    GraphsComponent,
    HttpService,
    MatDatepickerModule,
    {
      provide: RouteReuseStrategy,
      useClass: CustomRouteReuseStrategy,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
