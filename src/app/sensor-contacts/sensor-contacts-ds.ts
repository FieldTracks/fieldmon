/*
This file is part of fieldmon - (C) The Fieldtracks Project

    fieldmon is distributed under the civilian open source license (COSLi).
    Military usage is forbidden.

    You should have received a copy of COLi along with fieldmon.
    If not, please contact info@fieldtracks.org

 */
import {CollectionViewer, DataSource} from '@angular/cdk/collections';
import {MqttAdapterService} from '../mqtt-adapter.service';
import {BehaviorSubject, interval, Observable, Subscription} from 'rxjs';
import {Observation, StoneEvent} from '../model/StoneEvent';
import {SensorContactTable} from '../model/sensor-contact-table';
import { IMqttMessage } from 'ngx-mqtt';
import { GDataSource } from '../helpers/GDataSource';

export class SensorContactsDs extends GDataSource<SensorContactTable> {

    private static _data: SensorContactTable[] = [];

    constructor(protected mqttService: MqttAdapterService) {
        super('/JellingStone/#', SensorContactsDs._data);
    }

    protected parseMessage(message: IMqttMessage) {
        const stoneEvent: StoneEvent = JSON.parse(message.payload.toString());

        const stone = `(${stoneEvent.major},${stoneEvent.minor})`;
        const stmp = stoneEvent.timestmp;

        stoneEvent.data.forEach( (obs: Observation) => {
            const contact = new SensorContactTable();
            if (obs.minor) {
                contact.subject = `${obs.major} / ${obs.minor} / ${obs.uuid}`;
            } else {
                contact.subject = `${obs.mac}`;
            }

            var element: SensorContactTable = (SensorContactsDs._data.find(element => element.subject === contact.subject));
            if(element !== undefined){
                element.timestmp = stmp;
                return;
            }

            contact.rssi = `${obs.min} / ${obs.max} /${obs.avg} / ${obs.remoteRssi}`;
            contact.stone = stone;
            contact.timestmp = stmp;
            SensorContactsDs._data.unshift(contact);
        });
    }
}