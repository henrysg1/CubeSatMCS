import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BucketDialogComponent } from './bucket-dialog.component';

describe('BucketDialogComponent', () => {
  let component: BucketDialogComponent;
  let fixture: ComponentFixture<BucketDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BucketDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BucketDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
