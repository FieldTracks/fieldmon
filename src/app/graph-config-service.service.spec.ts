import { TestBed } from '@angular/core/testing';

import { GraphConfigService } from './graph-config.service';

describe('GraphConfigServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GraphConfigService = TestBed.get(GraphConfigService);
    expect(service).toBeTruthy();
  });
});
