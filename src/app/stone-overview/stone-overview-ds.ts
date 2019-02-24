/*
This file is part of fieldmon - (C) The Fieldtracks Project

    fieldmon is distributed under the civilian open source license (COSLi).
    Military usage is forbidden.

    You should have received a copy of COLi along with fieldmon.
    If not, please contact info@fieldtracks.org

 */
import {CollectionViewer, DataSource} from '@angular/cdk/collections';
import {StoneInTable} from '../model/stone-in-table';
import {MqttAdapterService} from '../mqtt-adapter.service';
import {StoneEvent} from '../model/StoneEvent';
import {EventEmitter} from '@angular/core';
import {BehaviorSubject, interval, Observable, Subscription} from 'rxjs';
import { IMqttMessage } from 'ngx-mqtt';
import { GDataSource } from '../helpers/GDataSource';

export class StoneOverviewDs extends GDataSource<StoneInTable> {

  private static stones: StoneInTable [] = [];

  constructor(protected mqttService: MqttAdapterService) {
    super('/JellingStone/#', StoneOverviewDs.stones);
  }

  protected parseMessage(message: IMqttMessage) {
    const sE: StoneEvent = JSON.parse(message.payload.toString());

    for (const s of StoneOverviewDs.stones) {
      if (s.uuid === sE.uuid && s.major === sE.major && s.minor === sE.minor) {
        s.lastSeen = sE.timestamp;
        return;
      } else {
      }
    }
    const stone: StoneInTable = new StoneInTable(sE.comment, sE.uuid, sE.major, sE.minor, sE.timestamp);
    StoneOverviewDs.stones.push(stone);
  }
}
