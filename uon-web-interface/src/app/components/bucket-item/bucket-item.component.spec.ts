import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BucketItemComponent } from './bucket-item.component';

describe('BucketItemComponent', () => {
  let component: BucketItemComponent;
  let fixture: ComponentFixture<BucketItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BucketItemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BucketItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
