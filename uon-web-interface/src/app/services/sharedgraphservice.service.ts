import { Injectable } from '@angular/core';
import {Observable, Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})

/**
 * Responsible for the connection of data between
 * the each graph component and its according directive.
 */

export class SharedgraphserviceService {

  private graphSubject = new Subject<any>();
  private archiveGraphSubject = new Subject<any>();
  private makeGraphSubject = new Subject<any>();
  private makeArchiveGraphSubject = new Subject<any>();

  constructor() { }

  /**
   * Publishes a request for a graph-item.component creation to the
   * add-graph.directive 
   * @param qualifiedName the parameter's qualified name
   */

  makeGraphPublish(qualifiedName: string): void{
    this.makeGraphSubject.next(qualifiedName);
  }

  /**
   * Used in the add-graph.directive
   * to listen for graph-item creation requests
   * @returns an observable of the makeGraphSubject
   */

  makeGraph(): Observable<any>{
    return this.makeGraphSubject.asObservable();
  }

  /**
   * Publishes a request for an archive-graph.component creation to the
   * archive-graph.directive 
   */

  makeArchiveGraphPublish(): void{
    this.makeArchiveGraphSubject.next(1);
  }

  /**
   * Used in the archive-graph.directive 
   * to listen for archive-graph creation requests
   * @returns an observable of the makeArchiveGraphSubject
   */

  makeArchiveGraph(): Observable<any>{
    return this.makeArchiveGraphSubject.asObservable();
  }

  /**
   * Used in the graph-item.component to send 
   * click events to the add-graph.directive and delete
   * the parameter's real time graph
   * @param qualifiedName the parameter's qualified name
   */

  sendGraphClickEvent(qualifiedName: string): void{
    this.graphSubject.next(qualifiedName);
  }

  /**
   * Used in the add-graph.directive to listen
   * for graph-item.component deletion requests 
   * @returns an observable of the graphSubject
   */

  getGraphClickEvent(): Observable<any>{
    return this.graphSubject.asObservable();
  }

  /**
   * Used in the archive-graph.component to send 
   * click events to the archive-graph.directive and delete
   * the parameter's archive graph
   * @param qualifiedName the parameter's qualified name 
   */

  sendArchiveGraphClickEvent(qualifiedName: string): void{
    this.archiveGraphSubject.next(qualifiedName);
  }

  /**
   * Used in the archive-graph.directive to listen
   * for archive-graph.component deletion requests 
   * @returns an observable of the archiveGraphSubject
   */

  getArchiveGraphClickEvent(): Observable<any>{
    return this.archiveGraphSubject.asObservable();
  }

}
