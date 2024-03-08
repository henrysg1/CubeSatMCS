import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { yamcsBaseUrl } from '../Interfaces/GraphData';

@Injectable({
  providedIn: 'root'
})
export class InstanceHandlerService {

  instance = new BehaviorSubject<string>("OBC");  //need to default this to OBC 

  constructor() {}

  /**
   * Returns an observable of the instance name
   * 
   * @returns an observable of the instance
   */
  getInstance(): Observable<string>{
    return this.instance.asObservable();
  }

  /**
   * Changes the instance name
   * 
   * @param instance the instance name
   */
  updateInstance(instance: string): void{
    this.instance.next(instance);
  }
}
