import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  Output,
} from "@angular/core";
import { catchError, throwError } from "rxjs";
import {
  ArgumentInfo,
  CustomTelecommandResponse,
  globalTelecommandsArray,
} from "src/app/Interfaces/Telecommands";
import { CommandInfo } from "src/app/Interfaces/Telecommands";
import { ArgumentMemberInfo } from "src/app/Interfaces/ListParameterResponse";
import { DataserviceService } from "src/app/services/dataservice.service";
import {
  UntypedFormArray,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { TelecommandsComponent } from "../telecommands/telecommands.component";
import { compareWithCurretTime } from "src/app/validators/time-validation";
import { yamcsBaseUrl } from "src/app/Interfaces/GraphData";
import { InstanceHandlerService } from "src/app/services/instance-handler.service";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: "app-telecommand-item",
  templateUrl: "./telecommand-item.component.html",
  styleUrls: ["./telecommand-item.component.css"],
})
export class TelecommandItemComponent implements OnInit, OnDestroy {
  arguments: ArgumentInfo[] = [];
  showInitialValuesArgs: boolean = false;
  tcUrl: string = "";
  response!: any | undefined;
  command!: CommandInfo;
  assignedArgumentsNames: string[] = [];
  yamcsInstanceName!: string;
  registrationForm = this.fb.group({
    args: this.fb.group({}),
  });
  argsForm = this.registrationForm.get("args") as UntypedFormGroup;

  timeNow!: Date;

  constructor(
    private http: HttpClient,
    private dataService: DataserviceService,
    private fb: UntypedFormBuilder,
    private telecommands: TelecommandsComponent,
    private instanceHandler: InstanceHandlerService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
    this.instanceHandler
      .getInstance()
      .subscribe((instance) => (this.yamcsInstanceName = instance));
    this.activatedRoute.params.subscribe((params) => {
      const name = params["telecommand"];
      this.command =
        globalTelecommandsArray[
          globalTelecommandsArray.findIndex(
            (command) => command.qualifiedName == name
          )
        ];
    });
  }

  ngOnInit(): void {
    this.dataService.currentgreekTime.subscribe((time) => {
      this.timeNow = time;
    });
    this.getTCinfo(this.command);
    this.clearAssignedArguments();
  }

  getTCinfo(tc: CommandInfo) {
    if (tc.hasOwnProperty("baseCommand")) {
      let index = globalTelecommandsArray.findIndex(
        (specific: CommandInfo) =>
          specific.qualifiedName == tc.baseCommand.qualifiedName
      );
      this.getTCinfo(globalTelecommandsArray[index]);
    }

    if (tc.hasOwnProperty("argumentAssignment")) {
      for (let i = 0; i < tc.argumentAssignment.length; i++) {
        this.assignedArgumentsNames.push(tc.argumentAssignment[i].name);
      }
    }

    if (tc.hasOwnProperty("argument")) {
      for (let i = 0; i < tc.argument.length; i++) {
        this.arguments.push(tc.argument[i]);
        if (tc.argument[i].hasOwnProperty("initialValue")) {
          this.argsForm.addControl(
            tc.argument[i].name,
            this.fb.control(tc.argument[i].initialValue)
          );
        } else if (tc.argument[i].type.engType.endsWith("[]")) {
          this.argsForm.addControl(tc.argument[i].name, this.fb.array([]));
        } else if (!this.isNotAggregate(tc.argument[i])) {
          this.argsForm.addControl(tc.argument[i].name, this.fb.group({}));
          let aggrForm = this.argsForm.get(
            tc.argument[i].name
          ) as UntypedFormGroup;
          for (let j = 0; j < tc.argument[i].type.member.length; j++) {
            aggrForm.addControl(
              tc.argument[i].type.member[j].name,
              this.fb.control("")
            );
          }
        } else {
          this.argsForm.addControl(tc.argument[i].name, this.fb.control(""));
        }
      }
    }
    this.argsForm
      .get("release_time")
      ?.setValidators(compareWithCurretTime(this.timeNow));

    this.argsForm.get("release_time")?.updateValueAndValidity();
  }

  clearAssignedArguments(): void {
    for (let i = 0; i < this.arguments.length; i++) {
      if (this.assignedArgumentsNames.includes(this.arguments[i].name)) {
        this.argsForm.removeControl(this.arguments[i].name);
        this.arguments.splice(i, 1);
        i--;
      }
    }
  }

  sendTC(): void {
    this.argsForm
      .get("release_time")
      ?.patchValue(JSON.stringify(this.argsForm.get("release_time")?.value));
    const editTime = this.argsForm.get("release_time")?.value.replace(/"/g, "");

    this.argsForm.get("release_time")?.patchValue(editTime);

    if (this.yamcsInstanceName == "COMMS") {
      this.tcUrl = `${yamcsBaseUrl}/processors/${
        this.yamcsInstanceName
      }/realtime_comms/commands${<string>(
        this.command.qualifiedName?.toString()
      )}`;
    } else {
      this.tcUrl = `${yamcsBaseUrl}/processors/${
        this.yamcsInstanceName
      }/realtime/commands${<string>this.command.qualifiedName?.toString()}`;
    }

    this.http
      .post(this.tcUrl, this.registrationForm.value)
      .pipe(catchError(this.handleError))
      .subscribe((response) => {
        this.response = response;
        this.router.navigate([
          "/telecommands",
          this.command.qualifiedName,
          this.response.id,
        ]);
      });
  }

  /**
   *  Handles an http error if something goes wrong
   *  with the post request to YAMCS.
   */

  private handleError(error: HttpErrorResponse) {
    if (error.status == 0) {
      console.error("An error occured", error.error);
    } else {
      alert(
        "Error occured while sending the TC. Please make sure that all arguments are correct."
      );
      console.error(
        `Yamcs returned code ${error.status}, body was`,
        error.error,
        error.message,
        error.statusText
      );
    }
    return throwError(() => new Error("Something went wrong"));
  }

  getFormArray(argument: ArgumentInfo): UntypedFormArray {
    return this.argsForm.get(argument.name) as UntypedFormArray;
  }

  addToFormArray(argument: ArgumentInfo) {
    if (!this.argsForm.get(argument.name)?.invalid) {
      let index: number = -1;
      for (let i = 0; i < this.arguments.length; i++) {
        if (this.arguments[i].type.hasOwnProperty("dimensions")) {
          if (this.arguments[i].type.dimensions[0].argument == argument.name) {
            index = i;
            break;
          }
        }
      }

      if (index !== -1) {
        this.getFormArray(this.arguments[index]).clear();
        for (let i = 0; i < +this.argsForm.get(argument.name)?.value; i++) {
          if (!this.isNotAggregateArray(this.arguments[index])) {
            this.getFormArray(this.arguments[index]).push(this.fb.group({}));
            let temp = this.getFormArray(this.arguments[index]).at(
              i
            ) as UntypedFormGroup;
            for (
              let j = 0;
              j < this.arguments[index].type.elementType.member.length;
              j++
            ) {
              temp.addControl(
                this.arguments[index].type.elementType.member[j].name,
                this.fb.control("")
              );
            }
          } else {
            this.getFormArray(this.arguments[index]).push(this.fb.control(""));
          }
        }
      }
    }
  }

  toggleInitialValues(): void {
    this.showInitialValuesArgs = !this.showInitialValuesArgs;
  }

  newCurrentTime() {
    this.argsForm
      .get("release_time")
      ?.setValidators(compareWithCurretTime(this.timeNow));

    this.argsForm.get("release_time")?.updateValueAndValidity();
  }

  isNotEnumMember(member: ArgumentMemberInfo): boolean {
    return !(member.type.engType == "enumeration");
  }

  isNotEnumArray(argument: ArgumentInfo): boolean {
    return !(argument.type.engType == "enumeration[]");
  }

  isNotEnum(argument: ArgumentInfo): boolean {
    return !(argument.type.engType == "enumeration");
  }

  isNotAggregateArray(argument: ArgumentInfo): boolean {
    return !(argument.type.engType == "aggregate[]");
  }

  isNotIntegerArray(argument: ArgumentInfo): boolean {
    return !(argument.type.engType == "integer[]");
  }

  isNotFloatArray(argument: ArgumentInfo): boolean {
    return !(argument.type.engType == "float[]");
  }

  isNotBinaryArray(argument: ArgumentInfo): boolean {
    return !(argument.type.engType == "binary[]");
  }

  isNotAggregate(argument: ArgumentInfo): boolean {
    return !(argument.type.engType == "aggregate");
  }

  isNotBoolean(argument: ArgumentInfo): boolean {
    return !(argument.type.engType == "boolean");
  }

  isNotInteger(argument: ArgumentInfo): boolean {
    return !(argument.type.engType == "integer");
  }

  isNotFloat(argument: ArgumentInfo): boolean {
    return !(argument.type.engType == "float");
  }

  /**
   * @param argument the argument we want
   * @returns the engineering type of the argument
   */
  getArgumentEngType(argument: ArgumentInfo): string {
    return argument.type.engType;
  }

  getRangeMin(argument: ArgumentInfo): number {
    return argument.type.rangeMin;
  }

  getRangeMax(argument: ArgumentInfo): number {
    return argument.type.rangeMax;
  }

  getMemberRangeMin(member: ArgumentMemberInfo): number {
    return member.type.rangeMin;
  }

  getMemberRangeMax(member: ArgumentMemberInfo): number {
    return member.type.rangeMax;
  }

  ngOnDestroy(): void {
    this.telecommands.onViewChange();
  }
}
