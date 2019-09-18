import {Injectable, OnDestroy} from '@angular/core';
import {MqttAdapterService} from './mqtt-adapter.service';
import {BehaviorSubject, Observable, Subject, Subscription} from 'rxjs';
import {AggregatedDevice} from './model/aggregated/aggregated-devices';
import {StoneEvent} from './model/StoneEvent';
import {distinct, filter, map} from 'rxjs/operators';
import {AggregatedName} from './model/aggregated/aggregated-name';
import {StoneStatus} from './model/stone-status';
import {AggregatedStone} from './model/aggregated/aggregated-stone';

@Injectable({
  providedIn: 'root'
})
export class StoneService implements OnDestroy {

  private stoneEventSubscription: Subscription;
  private nameEventSubscription: Subscription;

  knownDevices: BehaviorSubject<Map<string, AggregatedDevice>>;
  names: BehaviorSubject<Map<string, string>> = new BehaviorSubject(new Map());

  constructor(private mqttServer: MqttAdapterService) {
    this.knownDevices =  new BehaviorSubject(new Map());
    this.stoneEventSubscription = mqttServer.stoneEventSubject().subscribe((sE) => {
      return this.handleStoneEvent(sE);
    });
    this.nameEventSubscription = mqttServer.aggregatedNamesSubject().subscribe((nE) => {
      // @ts-ignore
      return this.handleNameEvent(nE);
    });

  }

  public name(mac: string): Observable<AggregatedName> {
    return this.mqttServer.aggregatedNamesSubject().pipe(
      map( (nameMap: Map<string, AggregatedName>) => nameMap.get(mac),
      distinct()
      )
    );
  }


  public infoStatic(mac: string): AggregatedDevice {
    return this.knownDevices.getValue().get(mac);
  }

  public nameStatic(mac: string): string {
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
    const newMap = new Map(this.knownDevices.getValue());
    let newDevicesDiscoverd = false;
    const newNames = new Map<string, string>();
    n.forEach( (name, mac) => {
      newNames.set(mac, name.name);
      if (!newMap.get(mac)) {
        newMap.set(mac, {timestamp: new Date('1970-01-01')});
        newDevicesDiscoverd = true;
      }
    });
    this.names.next(newNames);
    if (newDevicesDiscoverd) {
      this.knownDevices.next(newMap);
    }
  }
}
