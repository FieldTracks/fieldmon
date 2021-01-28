import {Injectable, OnDestroy} from '@angular/core';
import {IMqttMessage, IMqttServiceOptions, MqttConnectionState, MqttService} from 'ngx-mqtt';
import {environment} from './../environments/environment';
import {BehaviorSubject, Observable, Subject, Subscription} from 'rxjs';
import {Router} from '@angular/router';
import {StoneConfiguration} from './model/StoneConfiguration';
import {filter, map} from 'rxjs/operators';
import {FlashtoolStatus} from './model/flashtool/flashtool-status';
import {AggregatedStone, AggregatedStoneSensorContact} from './model/aggregated/aggregated-stone';
import {AggregatedGraph, AggregatedGraphLink, AggregatedGraphNode} from './model/aggregated/aggregated-graph';
import {StoneEvent} from './model/StoneEvent';
import { AggregatedName } from './model/aggregated/aggregated-name';
import {AggregatedDevice} from './model/aggregated/aggregated-devices';
import {FieldmonConfig} from './model/configuration/fieldmon-config';
import {StoneStatus} from './model/stone-status';
import {LoginService} from './login.service';

export const MQTT_SERVICE_OPTIONS: IMqttServiceOptions = {
  hostname: environment.mqtt_broker,
  port: environment.mqtt_port,
  path: environment.mqtt_path,
  protocol: 'wss',
  connectOnCreate: false,
};
@Injectable({
  providedIn: 'root',
})
export class MqttAdapterService implements OnDestroy {

  private mqttService: MqttService = new MqttService(MQTT_SERVICE_OPTIONS);
  private loginSubscript: Subscription;

  constructor(private router: Router, private loginService: LoginService) {
    MQTT_SERVICE_OPTIONS.password = 'jwt';
    MQTT_SERVICE_OPTIONS.username = loginService.tokenSubject.getValue();
    console.log('Setting token', MQTT_SERVICE_OPTIONS.username);
    this.loginSubscript = loginService.token().subscribe( (v) => this.credential_update(v));
  }

  credential_update(token: string) {
    MQTT_SERVICE_OPTIONS.username = token;
    try {
      this.mqttService.disconnect();
    } catch (e) {
      // Ingore errors when disconnecting
    }

    finally {
      this.mqttService.connect(MQTT_SERVICE_OPTIONS);

    }

  }

  ngOnDestroy(): void {
       if (this.loginSubscript) {
         this.loginSubscript.unsubscribe();
       }
    }


  public publishName(mac: String, name: String): void {
    this.mqttService.publish('NameUpdate', JSON.stringify({
      'mac': mac,
      'name': name,
      'color': '#ff0000'}))
      .subscribe().unsubscribe();
  }

  public getSubscription(channel: string, handle: (message: IMqttMessage) => void): Subscription {
    return this.mqttService.observe(channel).subscribe(handle);
  }

  public sendInstallSoftware(sc: StoneConfiguration) {
    const sub = this.mqttService.publish('flashtool/command', JSON.stringify({
      operation: 'full_flash',
      stone: sc
    })).subscribe().unsubscribe();
  }

  public sendInstallConfiguration(sc: StoneConfiguration) {
    this.mqttService.publish('flashtool/command', JSON.stringify({
      operation: 'nvs',
      stone: sc
    })).subscribe().unsubscribe();
  }

  public aggregatedStonesSubject(): Observable<Map<string, AggregatedStone>> {
    return this.mqttService.observe('Aggregated/Stones').pipe(map(
      (message: IMqttMessage) => {
        return JSON.parse(message.payload.toString());
      }
    ));
  }

  public statusSubject(mac: string): Observable<StoneStatus> {
    console.log(`Topic: JellingStoneStatus/${mac}`);
    return this.mqttService.observe(`JellingStoneStatus/${mac}`).pipe(map(
      (message: IMqttMessage) => {
        return JSON.parse(message.payload.toString());
      }
    ));
  }

  public aggregatedNamesSubject(): Observable<Map<string, AggregatedName>> {
    return this.mqttService.observe('Aggregated/Names').pipe(map(
      (message: IMqttMessage) => {
        const parsed = new Map<string, AggregatedName>();
        const result = JSON.parse(message.payload.toString());
        for (const mac in result) {
          if (mac) {
            parsed.set(mac, result[mac]);
          }
        }
        return parsed;
      }
    ));
  }

  public aggregatedGraphSubject(): Observable<AggregatedGraph> {
    return this.aggregatedStonesSubject().pipe(map(stoneMap => {
      const nodeMap = new Map<string, AggregatedGraphNode>();
      const links: AggregatedGraphLink[] = [];

      // Build node database
      for (const mac in stoneMap) {
        if (mac) {
          nodeMap.set(mac, {id: mac, timestamp: new Date(stoneMap[mac].timestamp)});
          stoneMap[mac].contacts.forEach( (contact) => {
            nodeMap.set(contact.mac, {id: contact.mac});
          });
        }
      }

      // Build link database
      for (const mac in stoneMap) {
        if (mac) {
          const stone = stoneMap[mac];
          stone.contacts.forEach( (contact) => {
            links.push(
              {source: mac, target: contact.mac, rssi: contact.rssi_avg, timestamp: new Date(stone.timestamp)});
          });
        }
      }

      // Collect nodeMap and links
      return  {
        links: links,
        nodes: Array.from(nodeMap.values())
      };
    }));
  }

  public stoneEventSubject(): Observable<StoneEvent> {
    return this.mqttService.observe('JellingStone/#').pipe(map(
      (message: IMqttMessage) => {
        return {...JSON.parse(message.payload.toString()), mac: message.topic.replace('JellingStone/', '')};
      }
    ));

  }

  public flashToolSubject(): Observable<FlashtoolStatus> {
    return this.mqttService.observe('flashtool/status/#').pipe(filter(
      (message: IMqttMessage) => {
        return message.payload.toString() !== '';
      }
    )).pipe(map(
      (message: IMqttMessage) => {
        return JSON.parse(message.payload.toString());
      }
    ));

  }


  public fieldmonSubject(): Observable<FieldmonConfig> {
    return this.mqttService.observe('fieldmon/config').pipe(map(
      (message: IMqttMessage) => {
        return JSON.parse(message.payload.toString());
      }
    ));
  }

  public publishFieldmonConfig(config: FieldmonConfig): void {
    this.mqttService.publish('fieldmon/config', JSON.stringify(config), {qos: 1, retain: true})
      .subscribe().unsubscribe();
  }


}
