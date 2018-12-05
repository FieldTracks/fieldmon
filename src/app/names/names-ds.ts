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

export class NamesDs extends GDataSource<Names> {

    private static data: Names[] = [];

    constructor(protected mqttService: MqttAdapterService) {
        super('Aggregated/Stones', NamesDs.data); 
        while(NamesDs.data.length > 0){
            NamesDs.data.pop();
        } // Some stupid JS Stuff. Don't know an other way -.-
    }

    parseMessage(message: IMqttMessage){
        const data = JSON.parse(message.payload.toString());
        //console.log(data);

        let stones: Names[] = []; 
        Object.getOwnPropertyNames(data).forEach((name: string) => {
            console.log(name);
            let stone: Names = new Names();
            stone.Mac = name;
            stone.Major = data[name]['major'];
            stone.Minor = data[name]['minor'];

            let rssi = 0;
            data[name]['contacts'].forEach((contact) => {
                rssi += parseInt(contact['rssi_avg']);
            });
            stone.RSSI = rssi / data[name]['contacts'].length;

            stone.UUID = data[name]['uuid'];
            stone.timestmp = data[name]['last_seen'];
            stone.color = "white";

            stones.push(stone);
        });

        stones.forEach((element: Names) => {
            let index = NamesDs.data.findIndex((value: Names) => {
                return value.Mac === element.Mac;
            });

            if(index === -1){
                NamesDs.data.push(element);
            }else{
                NamesDs.data[index].timestmp = element.timestmp;
                NamesDs.data[index].color = 'orange';
            }
        });

        NamesDs.data.sort((a :Names, b :Names) => {
            return a.RSSI - b.RSSI;
        });
    }
}