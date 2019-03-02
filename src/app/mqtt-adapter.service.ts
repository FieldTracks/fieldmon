import {Injectable} from '@angular/core';
import {IMqttMessage, IMqttServiceOptions, MqttConnectionState, MqttService} from 'ngx-mqtt';
import {environment} from './../environments/environment';
import {BehaviorSubject, Observable, Subject, Subscription} from 'rxjs';
import {Router} from '@angular/router';
import {StoneConfiguration} from './model/StoneConfiguration';
import {map} from 'rxjs/operators';
import {FlashtoolStatus} from './model/flashtool/flashtool-status';
import {AggregatedStone, AggregatedStoneSensorContact} from './model/aggregated/aggregated-stone';
import {AggregatedGraph, AggregatedGraphLink, AggregatedGraphNode} from './model/aggregated/aggregated-graph';
import {StoneEvent} from './model/StoneEvent';

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
export class MqttAdapterService {

  private mqttService: MqttService = new MqttService(MQTT_SERVICE_OPTIONS);
  private loginSubscript: Subscription;


  authChange = new BehaviorSubject<boolean>(false);


  constructor(private router: Router) {
    if (sessionStorage.getItem('username') !== null && sessionStorage.getItem('password') !== null) {
      this.login(sessionStorage.getItem('username'), sessionStorage.getItem('password'));
    }
  }

  public login(username: string, password: string): BehaviorSubject<MqttConnectionState> {
    sessionStorage.setItem('username', username);
    sessionStorage.setItem('password', password);

    MQTT_SERVICE_OPTIONS.username = sessionStorage.getItem('username');
    MQTT_SERVICE_OPTIONS.password = '';
    console.log('Connecting to', MQTT_SERVICE_OPTIONS);

    MQTT_SERVICE_OPTIONS.password = sessionStorage.getItem('password');

    try {
      this.mqttService.disconnect();
    } catch (err) {
      // Ignore error - we just disconnect.
    }
    console.log('Connecting');

    this.loginSubscript = this.mqttService.state.subscribe((status) => {
      if (status === MqttConnectionState.CONNECTED) {
        this.authChange.next(true);
        if (this.loginSubscript) {
          this.loginSubscript.unsubscribe();
        }
      } else if (status === MqttConnectionState.CLOSED) {
        this.authChange.next(false);
        if (this.loginSubscript) {
          this.loginSubscript.unsubscribe();
        }
      }
    });
    this.mqttService.connect(MQTT_SERVICE_OPTIONS);

    return this.mqttService.state;
  }

  public logout(): void {
    sessionStorage.setItem('username', '');
    sessionStorage.setItem('password', '');
    this.mqttService.disconnect();
    this.authChange.next(false);

  }

  public publishName(mac: String, name: String): void {
    if (!name) {
      return;
    }
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

  public aggregatedGraphSubject(): Observable<AggregatedGraph> {
    return this.aggregatedStonesSubject().pipe(map(stoneMap => {
      const links: AggregatedGraphLink[] = [];
      const nodes: AggregatedGraphNode[] = [];
      const nodeDict: AggregatedGraphNode[] = [];

      // Collect nodes and links
      for (const mac in stoneMap) {
        if (mac) {
          nodeDict[mac] = {id: mac};
          nodes.push(nodeDict[mac]);
        }
      }
      for (const mac in stoneMap) {
        if (mac) {
          const stone: AggregatedStone = stoneMap[mac];
          stone.contacts.forEach( (contact) => {
            const link = {source: nodes[mac], target: nodes[contact.mac], rssi: contact.rssi_avg,
              timestamp: new Date(stone.last_seen * 1000)};
            links.push(link);
          });

        }
      }
      return  {
        links: links,
        nodes: nodes,
      };
    }));
  }

  public stoneEventSubject(): Observable<StoneEvent> {
    return this.mqttService.observe('JellingStone/#').pipe(map(
      (message: IMqttMessage) => {
        return JSON.parse(message.payload.toString());
      }
    ));

  }

  public flashToolSubject(): Observable<FlashtoolStatus> {
    return this.mqttService.observe('flashtool/status/#').pipe(map(
      (message: IMqttMessage) => {
        return JSON.parse(message.payload.toString());
      }
    ));

  }


}
