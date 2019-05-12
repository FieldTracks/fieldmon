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

  knownDevices: BehaviorSubject<Map<string, AggregatedDevice>>;
  names: BehaviorSubject<Map<string, string>> = new BehaviorSubject(new Map());

  constructor(mqttServer: MqttAdapterService) {
    this.knownDevices =  new BehaviorSubject(new Map());
    this.stoneEventSubscription = mqttServer.stoneEventSubject().subscribe((sE) => {
      return this.handleStoneEvent(sE);
    });
    this.nameEventSubscription = mqttServer.aggregatedNamesSubject().subscribe((nE) => {
      // @ts-ignore
      return this.handleNameEvent(nE);
    });

  }

  public info(mac: string): AggregatedDevice {
    return this.knownDevices.getValue().get(mac);
  }

  public name(mac: string): string {
    return this.names.getValue().get(mac);
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
    // const current: AggregatedDevice[] = [...this.knownDevices.getValue()];
    const newMap = new Map(this.knownDevices.getValue());
    newMap.set(sE.mac, {...sE});
    sE.data.forEach( (observation) => {
      const device = newMap.get(observation.mac);
      if (device) {
        device.timestamp = sE.timestamp;
        device.major = observation.major;
        device.minor = observation.minor;
        device.uuid = observation.uuid;
      } else {
        newMap.set(observation.mac, {
          timestamp: sE.timestamp,
          major: observation.major,
          minor: observation.minor,
          uuid : observation.uuid
        });
      }
    });
    this.knownDevices.next(newMap);
  }

  private handleNameEvent(n: Map<string, AggregatedName>) {
    const newNames = new Map<string, string>();
    n.forEach( (name, mac) => {
      newNames.set(mac, name.name);
    })
    this.names.next(newNames);
  }
}
