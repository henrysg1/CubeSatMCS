import { Directive, ViewContainerRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { archiveGraphNames } from 'src/app/Interfaces/GraphData';
import { SharedgraphserviceService } from 'src/app/services/sharedgraphservice.service';
import { ArchiveGraphComponent } from '../../graphing/archive-graph/archive-graph.component';
import { InstanceHandlerService } from 'src/app/services/instance-handler.service';

@Directive({
  selector: '[appArchiveGraph]'
})

/**
 * Responsible for the creation/deletion of the archive-graph.component.
 */

export class ArchiveGraphDirective{
  makeArchiveGraphSubscription !: Subscription;
  clickEventSubscription !: Subscription;
  yamcsInstanceName!:string;
  constructor(private viewContainerRef: ViewContainerRef, private sharedService: SharedgraphserviceService, private instanceHandler: InstanceHandlerService) {
    this.clickEventSubscription = this.sharedService.getArchiveGraphClickEvent().subscribe((type) => this.deleteArchiveGraph(type));
    this.makeArchiveGraphSubscription = this.sharedService.makeArchiveGraph().subscribe(() => this.makeArchiveGraph());
    this.instanceHandler.getInstance().subscribe((instanceName) => (this.yamcsInstanceName = instanceName))
   }

   /**
    * Creates an archive graph component
    */

  makeArchiveGraph(): void{
   const graphItem = this.viewContainerRef.createComponent(ArchiveGraphComponent);
   graphItem.instance.instanceName = this.yamcsInstanceName;

  }

  /**
   * Delets an archive graph by searching for the parameter's 
   * qualified name inside an array, splicing the array
   * and removing the component from the viewContainerRef
   * 
   * @param qualifiedName the parameter's qualified name
   */

  deleteArchiveGraph(qualifiedName: string): void{
    let index = archiveGraphNames.findIndex((itsName) => (itsName == qualifiedName));
    this.viewContainerRef.remove(index);
    archiveGraphNames.splice(index,1);
  }

}
