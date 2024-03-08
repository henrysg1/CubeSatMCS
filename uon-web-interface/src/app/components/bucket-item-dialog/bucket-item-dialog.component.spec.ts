import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BucketItemDialogComponent } from './bucket-item-dialog.component';

describe('BucketItemDialogComponent', () => {
  let component: BucketItemDialogComponent;
  let fixture: ComponentFixture<BucketItemDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BucketItemDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BucketItemDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
