import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TelecommandsHistoryComponent } from './telecommands-history.component';

describe('TelecommandsHistoryComponent', () => {
  let component: TelecommandsHistoryComponent;
  let fixture: ComponentFixture<TelecommandsHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TelecommandsHistoryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TelecommandsHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
