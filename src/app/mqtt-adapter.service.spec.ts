import { TestBed, inject } from '@angular/core/testing';

import { MqttAdapterService } from './mqtt-adapter.service';

describe('MqttAdapterService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MqttAdapterService]
    });
  });

  it('should be created', inject([MqttAdapterService], (service: MqttAdapterService) => {
    expect(service).toBeTruthy();
  }));
});
