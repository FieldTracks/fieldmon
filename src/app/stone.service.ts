import {Injectable, OnDestroy} from '@angular/core';
import {MqttAdapterService} from './mqtt-adapter.service';
import {BehaviorSubject, Observable, Subject, Subscription} from 'rxjs';
import {AggregatedDevice} from './model/aggregated/aggregated-devices';
import {StoneEvent} from './model/StoneEvent';
import {map} from 'rxjs/operators';
import {AggregatedName} from './model/aggregated/aggregated-name';

@Injectable({
  providedIn: 'root'
})
export class StoneService implements OnDestroy {

  private stoneEventSubscription: Subscription;
  private nameEventSubscription: Subscription;

  knownDevices: BehaviorSubject<AggregatedDevice[]>;
  names: BehaviorSubject<string[]> = new BehaviorSubject([]);

  constructor(mqttServer: MqttAdapterService) {
    this.knownDevices =  new BehaviorSubject([]);
    this.stoneEventSubscription = mqttServer.stoneEventSubject().subscribe((sE) => {
      return this.handleStoneEvent(sE);
    });
    this.nameEventSubscription = mqttServer.aggregatedNamesSubject().subscribe((nE) => {
      // @ts-ignore
      return this.handleNameEvent(nE);
    });

  }
  ngOnDestroy(): void {
    if (this.stoneEventSubscription) {
      this.stoneEventSubscription.unsubscribe();
    }
    if (this.nameEventSubscription) {
      this.nameEventSubscription.unsubscribe();
    }
  }

  private handleStoneEvent(sE: StoneEvent) {
    const current: AggregatedDevice[] = [...this.knownDevices.getValue()];
    current[sE.mac] = {...sE};
    sE.data.forEach( (observation) => {
      const device = current[observation.mac];
      if (device) {
        device.timestamp = sE.timestamp;
        device.major = observation.major;
        device.minor = observation.minor;
        device.uuid = observation.uuid;
      } else {
        current[observation.mac] = {
          timestamp: sE.timestamp,
          major: observation.major,
          minor: observation.minor,
          uuid : observation.uuid
        };
      }
    });
    this.knownDevices.next(current);
  }

  private handleNameEvent(n: AggregatedName[]) {
    const newNames: string[] = [];
    for (const mac in n) {
      if (mac) {
        newNames[mac] = n[mac].name;
      }
    }
    console.log('Emitting new names', newNames);
    this.names.next(newNames);
  }
}
