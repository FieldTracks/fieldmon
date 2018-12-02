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
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
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
  private static _password: string;
  private static _username: string;
  private static _connected: Boolean = false; // TODO: Check Status // eventuell ersetzen

  constructor(private router: Router) {
  }

  public login(username: string, password: string) {
    MqttAdapterService._username = username;
    MqttAdapterService._password = password;

    MQTT_SERVICE_OPTIONS.username = MqttAdapterService._username;
    MQTT_SERVICE_OPTIONS.password = MqttAdapterService._password;

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

  public getSubscription(channel: string, handle: (message: IMqttMessage) => void): Subscription {
    if(!MqttAdapterService._connected){
      console.log("redirect to login");
      this.router.navigateByUrl('/login');
      return null;
    }
    return MqttAdapterService._mqttService.observe(channel).subscribe(handle);
  }
}
