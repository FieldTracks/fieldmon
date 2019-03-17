import { TestBed } from '@angular/core/testing';

import { StoneServiceService } from './stone-service.service';

describe('StoneServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: StoneServiceService = TestBed.get(StoneServiceService);
    expect(service).toBeTruthy();
  });
});
