import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArchiveTelemetryComponent } from '../components/graphing/archive-telemetry/archive-telemetry.component';

describe('ArchiveTelemetryComponent', () => {
  let component: ArchiveTelemetryComponent;
  let fixture: ComponentFixture<ArchiveTelemetryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ArchiveTelemetryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ArchiveTelemetryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
