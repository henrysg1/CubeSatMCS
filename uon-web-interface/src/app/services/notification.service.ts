import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

/**
 * Responsible for notifying the user if a graph is already created
 */

export class NotificationService {

  public notification$: Subject<string> = new Subject();

  constructor() { }
}
