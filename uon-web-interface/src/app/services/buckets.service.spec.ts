import { TestBed } from '@angular/core/testing';

import { BucketsService } from './buckets.service';

describe('BucketsService', () => {
  let service: BucketsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BucketsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
