/*
This file is part of fieldmon - (C) The Fieldtracks Project

    fieldmon is distributed under the civilian open source license (COSLi).
    Military usage is forbidden.

    You should have received a copy of COLi along with fieldmon.
    If not, please contact info@fieldtracks.org

 */
import { Injectable } from '@angular/core';
import { IMqttMessage, IMqttServiceOptions, MqttService, IOnMessageEvent } from 'ngx-mqtt';
import { environment } from './../environments/environment';
import {Observable, Subject, Subscription} from 'rxjs';
import { Router } from '@angular/router';
import {StoneConfiguration} from './model/StoneConfiguration';
import {sanitizeHtml} from '@angular/core/src/sanitization/sanitization';
import {map} from 'rxjs/operators';
import {StoneEvent} from './model/StoneEvent';
import {FlashtoolStatus} from './model/flashtool-status';
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

  private static _mqttService: MqttService = new MqttService(MQTT_SERVICE_OPTIONS);
  private static _connected: Boolean = false; // TODO: Check Status // eventuell ersetzen

  constructor(private router: Router) {
    if (sessionStorage.getItem('username') !== null && sessionStorage.getItem('password') !== null) {
      this.login(sessionStorage.getItem('username'), sessionStorage.getItem('password'));
    }
  }

  public login(username: string, password: string) {
    sessionStorage.setItem('username', username);
    sessionStorage.setItem('password', password);

    MQTT_SERVICE_OPTIONS.username = sessionStorage.getItem('username');
    MQTT_SERVICE_OPTIONS.password = sessionStorage.getItem('password');

    try {
      MqttAdapterService._mqttService.disconnect(true);
    } catch (err) {
      // Ignore error - we just disconnect.
    }

    // What happens here?
    MqttAdapterService._mqttService.connect(MQTT_SERVICE_OPTIONS);
    MqttAdapterService._connected = true;
    MqttAdapterService._mqttService.onMessage.subscribe((event: IOnMessageEvent) => console.log(event));
  }

  public publishName(mac: String, name: String): void {
    if (!name) {
      return;
    }
    MqttAdapterService._mqttService.publish('NameUpdate', JSON.stringify({
      'mac': mac,
      'name': name,
      'color': '#ff0000'}));
  }

  public getSubscription(channel: string, handle: (message: IMqttMessage) => void): Subscription {
    if(!this.sanitize()){
      return;
    }
    return MqttAdapterService._mqttService.observe(channel).subscribe(handle);
  }

  public sendInstallSoftware(sc: StoneConfiguration) {
    MqttAdapterService._mqttService.publish('flashtool/command', JSON.stringify({
      operation: 'full_flash',
      stone: sc
    }));
  }

  public sendInstallConfiguration(sc: StoneConfiguration) {
    MqttAdapterService._mqttService.publish('flashtool/command', JSON.stringify({
      operation: 'nvs',
      stone: sc
    }));
  }

  public flashToolSubject(): Observable<FlashtoolStatus> {
    if (!this.sanitize()) {
      return;
    }
    return MqttAdapterService._mqttService.observe('flashtool/status/#').pipe(map(
      (message: IMqttMessage) => {
        return JSON.parse(message.payload.toString());
      }
    ));

  }

  private sanitize() {
    if (!MqttAdapterService._connected) {
      console.log('redirect to login');
      this.router.navigateByUrl('/login');
      return null;
    }
    return true;
  }
}
