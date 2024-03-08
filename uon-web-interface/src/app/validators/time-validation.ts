import { Input } from "@angular/core";
import {
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from "@angular/forms";

export function timeValidation(
  control: AbstractControl
): ValidationErrors | null {
  const startTime = control.get("start");
  const stopTime = control.get("stop");
  if (new Date(startTime!.value) > new Date(stopTime!.value)) {
    window.alert("Please enter start time older than stop time");
  }
  return new Date(startTime!.value) > new Date(stopTime!.value)
    ? { startGreaterstop: true }
    : null;
}

export function validationStart(val: Date): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const startTime = control.value;
    console.log(val);
    if (control.pristine) {
      return null;
    }

    if (new Date(startTime) < val) {
      window.alert("please enter start time newer than the 1st sample date");
    }
    return new Date(startTime) < val
      ? { "start time older than initial time": true }
      : null;
  };
}

export function validationStop(val: Date): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const stopTime = control.value;
    console.log(val);
    if (control.pristine) {
      return null;
    }
    if (new Date(stopTime) > val) {
      window.alert("please select stop time older than the last sample date ");
    }
    return new Date(stopTime) > val
      ? { "stop time newer than initial time": true }
      : null;
  };
}

export function compareWithCurretTime(val: Date): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const releaseTime = new Date(control.value);


    return releaseTime < val ? { nowTime: true } : null;
  };
}
