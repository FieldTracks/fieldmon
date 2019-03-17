/*
This file is part of fieldmon - (C) The Fieldtracks Project

    fieldmon is distributed under the civilian open source license (COSLi).
    Military usage is forbidden.

    You should have received a copy of COLi along with fieldmon.
    If not, please contact info@fieldtracks.org

 */
import { MqttAdapterService } from '../mqtt-adapter.service';
import { Observation, StoneEvent } from '../model/StoneEvent';
import { SensorContactTable } from '../model/sensor-contact-table';
import { IMqttMessage } from 'ngx-mqtt';
import { GDataSource } from '../helpers/GDataSource';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SensorContactsDs extends GDataSource<SensorContactTable> {

    private static _data: SensorContactTable[] = [];

    constructor(protected mqttService: MqttAdapterService) {
        super('JellingStone/#', SensorContactsDs._data);
    }

    protected parseMessage(message: IMqttMessage) {
        const stoneEvent: StoneEvent = JSON.parse(message.payload.toString());

        const stone = `(${stoneEvent.major},${stoneEvent.minor})`;
        const stmp = stoneEvent.timestamp;

        stoneEvent.data.forEach( (obs: Observation) => {
            const contact = new SensorContactTable(obs.mac, stoneEvent.mac);
            if (obs.minor) {
                contact.subject = `${obs.major} / ${obs.minor} / ${obs.uuid}`;
            } else {
                contact.subject = `${obs.mac}`;
            }

            const element: SensorContactTable = (SensorContactsDs._data.find(elem => elem.subject === contact.subject));
            if (element !== undefined) {
                element.timestamp = stmp;
                return;
            }

            contact.rssi = `${obs.min} / ${obs.max} /${obs.avg} / ${obs.remoteRssi}`;
            contact.stone = stone;
            contact.timestamp = stmp;
            SensorContactsDs._data.unshift(contact);
        });
    }
}
