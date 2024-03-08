import { TestBed } from '@angular/core/testing';

import { InstanceHandlerService } from '../services/instance-handler.service';

describe('InstanceHandlerService', () => {
  let service: InstanceHandlerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InstanceHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
