import { TestBed } from '@angular/core/testing';

import { HeaderBarService } from './header-bar.service';

describe('HeaderBarService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: HeaderBarService = TestBed.get(HeaderBarService);
    expect(service).toBeTruthy();
  });
});
