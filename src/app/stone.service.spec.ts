import { TestBed } from '@angular/core/testing';

import { StoneService } from './stone.service';

describe('StoneService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: StoneService = TestBed.get(StoneService);
    expect(service).toBeTruthy();
  });
});
