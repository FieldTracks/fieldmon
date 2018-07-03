/*
This file is part of fieldmon - (C) The Fieldtracks Project

    fieldmon is distributed under the civilian open source license (COSLi).
    Military usage is forbidden.

    You should have received a copy of COLi along with fieldmon.
    If not, please contact info@fieldtracks.org

 */
import {EventEmitter, Injectable} from '@angular/core';
import { IMqttMessage, IMqttServiceOptions, MqttService } from 'ngx-mqtt';
import { environment} from './../environments/environment';
import {Observable, Subscription} from 'rxjs';
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

  private _stones: EventEmitter<StoneEvent>;
  private subscription: Subscription;

  constructor(private _mqttService: MqttService) {
    this._stones = new EventEmitter<StoneEvent>();
  }

  unsubscibe() {
      try {
        this.subscription.unsubscribe();
      } catch (err) {
        // Ignore error - we just disconnect.
      }
  }

  subscribe() {
    MQTT_SERVICE_OPTIONS.username = localStorage.getItem('username');
    MQTT_SERVICE_OPTIONS.password = localStorage.getItem('password');
    console.log("Got:", localStorage.getItem('username'));

    try {
      this._mqttService.disconnect(true);
    } catch (err) {
      // Ignore error - we just disconnect.
    }

    try {
      this.subscription.unsubscribe();
    } catch (err) {
      // Ignore error - we just disconnect.
    }


    // What happens here?
    this._mqttService.connect(MQTT_SERVICE_OPTIONS);
    console.log('connected');

    this.subscription = this._mqttService.observe('/JellingStone/#').subscribe((message: IMqttMessage) => {
      console.log(message.payload.toString());
      const event: StoneEvent = JSON.parse(message.payload.toString());
      this._stones.emit(event);
    } );
    return this._stones;
  }

  subscribeLogin(username: string, password: string) {
    localStorage.setItem('username', username);
    localStorage.setItem('password', password);
    this.subscribe();
  }

  get stones(): Observable<StoneEvent> {
    return this._stones;
  }


}
