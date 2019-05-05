import { TestBed } from '@angular/core/testing';

import { WebdavService } from './webdav.service';

describe('WebdavService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: WebdavService = TestBed.get(WebdavService);
    expect(service).toBeTruthy();
  });
});
