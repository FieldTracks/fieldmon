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
import {BehaviorSubject, interval, Observable, Subscription} from 'rxjs';
import {Observation, StoneEvent} from '../model/StoneEvent';
import {EventEmitter} from '@angular/core';
import {Names} from '../model/Names';
import {ageC} from '../helpers/age-helper';
import { IMqttMessage } from 'ngx-mqtt';

export class NamesDs implements DataSource<Names> {

  private static contactsSubject: BehaviorSubject<Names[]> = new BehaviorSubject([]);
  private contacts: Names [] = [];
  public autoRefresh: Boolean = true;
  private _subscription: Subscription;

  constructor(private mqttService: MqttAdapterService) {

  }


  connect(collectionViewer: CollectionViewer): Observable<Names[]> {
    console.log('Subscribing ...');
    this._subscription = this.mqttService.getSubscription('/Aggregated/Stones', (message: IMqttMessage) => {
      var aggregated = JSON.parse(message.payload.toString());
      Object.getOwnPropertyNames(aggregated).forEach((value: string) => {
        var stone: Names = new Names();
        stone.Mac = value;
        stone.Major = aggregated[value]['major'];
        
      });
    });

    // Update every 5s
    interval(5000).subscribe(() => this.autoRefresh ? this.emit() : console.log('NOP'));
    return NamesDs.contactsSubject;
  }


  disconnect(collectionViewer: CollectionViewer): void {
    NamesDs.contactsSubject.complete();
    this._subscription.unsubscribe();
  }

  public emit() {
    console.log('Emitting', this.contacts);
    NamesDs.contactsSubject.next(this.contacts);
  }

  private updateContacts(stoneEvent: StoneEvent) {
    const stone = `(${stoneEvent.major},${stoneEvent.minor})`;
    const stmp = stoneEvent.timestmp;

    stoneEvent.data.forEach( (obs: Observation) => {
      for (const s of this.contacts) {
        if ((s.Mac === obs.mac && obs.mac !== undefined) || (s.UUID === obs.uuid && (s.Major === obs.major && s.Minor === obs.minor))) {
          return;
        }
      }
      const contact = new Names();
      contact.timestmp = stmp;
      contact.Mac = `${obs.mac}`;
      contact.Major = `${obs.major}`;
      contact.Minor = `${obs.minor}`;
      contact.RSSI = obs.avg;
      contact.UUID = `${obs.uuid}`;
      contact.Name = '';
      this.contacts.unshift(contact);
      this.contacts = this.contacts.sort((a, b) => {
        if (a < b) {
          return 1;
        } else if (a > b) {
          return -1;
        } else {
          return 0;
        }
      });
      }
    );
  }
}