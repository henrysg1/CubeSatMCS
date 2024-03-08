import { TestBed } from '@angular/core/testing';

import { SharedgraphserviceService } from '../services/sharedgraphservice.service';

describe('SharedgraphserviceService', () => {
  let service: SharedgraphserviceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SharedgraphserviceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
