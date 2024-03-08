import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { EnumValue } from "../Interfaces/ListParameterResponse";
import { CommandHistoryAttribute } from "../Interfaces/TcHistory";

@Injectable({
  providedIn: "root",
})

export class DataserviceService {
  private start = new BehaviorSubject<string>("");
  currentStart = this.start.asObservable();
  private stop = new BehaviorSubject<string>("");
  currentStop = this.stop.asObservable();
  private count = new BehaviorSubject<string>("");
  currentCount = this.count.asObservable();
  private parameterName = new BehaviorSubject<string>("");
  currentName = this.parameterName.asObservable();
  private ngIF = new BehaviorSubject<boolean>(true);
  currentNgIF = this.ngIF.asObservable();

  enumaratedMap = new Map();
  private enumVal = new BehaviorSubject<EnumValue[]>([]);
  currentEnumVal = this.enumVal.asObservable();

  greekTime = new BehaviorSubject<Date>(new Date());
  currentgreekTime = this.greekTime.asObservable();

  utcTime = new BehaviorSubject<Date>(new Date());
  currentUTCTime = this.utcTime.asObservable();

  tcStatusHistoryArray = new BehaviorSubject<Array<CommandHistoryAttribute[]>>(
    []
  );
  currentTcStatusHistoryArray = this.tcStatusHistoryArray.asObservable();

  tcVerifierHistoryArray = new BehaviorSubject<
    Array<CommandHistoryAttribute[]>
  >([]);

  currentTcVerifierHistoryArray = this.tcVerifierHistoryArray.asObservable();

  tcNameArray = new BehaviorSubject<string[]>([]);

  currentTcNameArray = this.tcNameArray.asObservable();

  tcAssigmentArray = new BehaviorSubject<Array<any[]>>([]); //if we know what type it is, change it

  currentTcAssigmentArray = this.tcAssigmentArray.asObservable();

  tcTimeArray = new BehaviorSubject<Date[]>([]);
  currentTcTimeAray = this.tcTimeArray.asObservable();

  tcIdArray = new BehaviorSubject<string[]>([]);
  currentTcIdArray = this.tcIdArray.asObservable();

  constructor() {}

  changeCommandTable(
    tcStatusArray: CommandHistoryAttribute[],
    tcVerifierArray: CommandHistoryAttribute[],
    tcName: string,
    tcAssigmentArray: any[],
    tcTimeArray: Date,
    tcIdArray: string
  ) {
    let currentValue = this.tcStatusHistoryArray.value;
    let updatedCommandTable = [...currentValue, tcStatusArray];

    this.tcStatusHistoryArray.next(updatedCommandTable);

    let updatedtcVerifierHistoryArray = [
      ...this.tcVerifierHistoryArray.value,
      tcVerifierArray,
    ];

    this.tcVerifierHistoryArray.next(updatedtcVerifierHistoryArray);

    let updatedNames = [...this.tcNameArray.value, tcName];
    this.tcNameArray.next(updatedNames);

    let updatedTcAssigment = [...this.tcAssigmentArray.value, tcAssigmentArray];

    this.tcAssigmentArray.next(updatedTcAssigment);

    let updatedTcId = [...this.tcIdArray.value, tcIdArray];
    this.tcIdArray.next(updatedTcId);

    let updatedTcDate = [...this.tcTimeArray.value, tcTimeArray];
    this.tcTimeArray.next(updatedTcDate);

    //let updatedTcTime = [...this.]
  }

  changeTime(time: Date): void {
    this.greekTime.next(time);
    this.utcTime.next(
      new Date(time.getTime() + time.getTimezoneOffset() * 60000)
    );
  }

  changeQueries(start: string, stop: string, count: string) {
    this.start.next(start);
    this.stop.next(stop);
    this.count.next(count);
  }

  changeParameterName(name: string): void {
    this.parameterName.next(name);
  }

  checkEnumMap(message: EnumValue[]): void {
    this.enumVal.next(message);
    for (let i = 0; i < message.length; i++) {
      if (this.enumaratedMap.has(message[i].label) == false) {
        this.enumaratedMap.set(message[i].label, Number(message[i].value));
      }
    }
  }
}
