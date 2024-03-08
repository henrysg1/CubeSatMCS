import { TestBed } from '@angular/core/testing';

import { ViewChangeService } from '../services/view-change.service';

describe('ViewChangeService', () => {
  let service: ViewChangeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ViewChangeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
