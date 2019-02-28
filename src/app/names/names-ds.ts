/*
This file is part of fieldmon - (C) The Fieldtracks Project

    fieldmon is distributed under the civilian open source license (COSLi).
    Military usage is forbidden.

    You should have received a copy of COLi along with fieldmon.
    If not, please contact info@fieldtracks.org

 */
import {MqttAdapterService} from '../mqtt-adapter.service';
import {Names} from '../model/Names';
import { IMqttMessage } from 'ngx-mqtt';
import { GDataSource } from '../helpers/GDataSource';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NamesDs extends GDataSource<Names> {

    private static data: Names[] = [];
    public static focus: string;

    constructor(protected mqttService: MqttAdapterService) {
        super('Aggregated/Stones', NamesDs.data);
        while (NamesDs.data.length > 0) {
            NamesDs.data.pop();
        } // Some stupid JS Stuff. Don't know an other way -.-
        NamesDs.focus = '';
    }

    parseMessage(message: IMqttMessage) {
        const data = JSON.parse(message.payload.toString());
        // console.log(data);

        const stones: Names[] = [];
        Object.getOwnPropertyNames(data).forEach((name: string) => {
            const stone: Names = new Names();
            stone.Mac = name;
            stone.Major = data[name]['major'];
            stone.Minor = data[name]['minor'];
            stone.Name = data[name]['comment'];

            stone.Name = data[name]['name'];

            if (data[name]['contacts'].length > 0) {
              let rssi = 0;
              data[name]['contacts'].forEach((contact) => {
                rssi += parseInt(contact['rssi_avg'], 10);
              });
              stone.RSSI = rssi / data[name]['contacts'].length;
            } else {
              stone.RSSI = -90;
            }

            stone.UUID = data[name]['uuid'];
            stone.timestamp = data[name]['last_seen'];
            stone.Color = 'white';
            stone.ShowEditnameField = false;

            stones.push(stone);
        });

        let wasUpdated: Boolean = false;
        NamesDs.data.forEach(x => x.Color = 'white');
        stones.forEach((element: Names) => {
            const index = NamesDs.data.findIndex((value: Names) => {
                return value.Mac === element.Mac;
            });

            if (index === -1) {
                NamesDs.data.push(element);
                wasUpdated = true;
            } else {
                NamesDs.data[index].timestamp = element.timestamp;
                if (wasUpdated && NamesDs.data[index].Mac !== NamesDs.focus) {
                  NamesDs.data[index].Color = 'orange';
                } else if (NamesDs.data[index].Mac === NamesDs.focus) {
                  NamesDs.data[index].Color = 'lightgreen';
                }
            }
        });

        NamesDs.data.sort((a: Names, b: Names) => {
            return b.RSSI - a.RSSI;
        });
    }
}
