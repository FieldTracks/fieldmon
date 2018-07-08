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
import {BehaviorSubject, Observable, Subscription} from 'rxjs';
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

  static messages: String = '';

  private static _stoneEvents: EventEmitter<StoneEvent> = new EventEmitter<StoneEvent>();
  private static subscription: Subscription;

  static currentEvents: BehaviorSubject<StoneEvent []> = new BehaviorSubject<StoneEvent[]>([]);
  private static stones = new Map();

  static stoneEvents(): Observable<StoneEvent> {
    return MqttAdapterService._stoneEvents;
  }

  static stoneStatus(): StoneEvent[] {
    return Array.from(MqttAdapterService.stones.values());
  }

  constructor(private _mqttService: MqttService) {

  }

  unsubscibe() {
      try {
        MqttAdapterService.subscription.unsubscribe();
      } catch (err) {
        // Ignore error - we just disconnect.
      }
  }

  subscribe() {
    MQTT_SERVICE_OPTIONS.username = localStorage.getItem('username');
    MQTT_SERVICE_OPTIONS.password = localStorage.getItem('password');
    console.log('All messages:', MqttAdapterService.messages);

    try {
      this._mqttService.disconnect(true);
    } catch (err) {
      // Ignore error - we just disconnect.
    }

    try {
      MqttAdapterService.subscription.unsubscribe();
    } catch (err) {
      // Ignore error - we just disconnect.
    }


    // What happens here?
    this._mqttService.connect(MQTT_SERVICE_OPTIONS);

    MqttAdapterService.subscription = this._mqttService.observe('/JellingStone/#').subscribe((message: IMqttMessage) => {
      const event: StoneEvent = JSON.parse(message.payload.toString());
      MqttAdapterService.messages += message.payload.toString();
      MqttAdapterService._stoneEvents.emit(event);
      MqttAdapterService.stones.set(StoneEvent.stoneId(event), event);
      MqttAdapterService.currentEvents.next(Array.from(MqttAdapterService.stones.values()));
    } );
    return MqttAdapterService._stoneEvents;

  }

  subscribeLogin(username: string, password: string) {
    localStorage.setItem('username', username);
    localStorage.setItem('password', password);
    MQTT_SERVICE_OPTIONS.username = localStorage.getItem('username');
    MQTT_SERVICE_OPTIONS.password = localStorage.getItem('password');
    console.log('All messages:', MqttAdapterService.messages);

    try {
      this._mqttService.disconnect(true);
    } catch (err) {
      // Ignore error - we just disconnect.
    }

    try {
      MqttAdapterService.subscription.unsubscribe();
    } catch (err) {
      // Ignore error - we just disconnect.
    }


    // What happens here?
    this._mqttService.connect(MQTT_SERVICE_OPTIONS);


    MqttAdapterService.subscription = this._mqttService.observe('/JellingStone/#').subscribe((message: IMqttMessage) => {
      console.log('Message:', message);
      const event: StoneEvent = JSON.parse(message.payload.toString());
      MqttAdapterService.messages += message.payload.toString();
      MqttAdapterService._stoneEvents.emit(event);
    } );
    return MqttAdapterService._stoneEvents;
  }




}
