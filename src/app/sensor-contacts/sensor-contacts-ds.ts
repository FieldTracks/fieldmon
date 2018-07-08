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
import {BehaviorSubject, interval, Observable} from 'rxjs';
import {Observation, StoneEvent} from '../model/StoneEvent';
import {EventEmitter} from '@angular/core';
import {SensorContactTable} from '../model/sensor-contact-table';
import {ageC} from '../helpers/age-helper';

export class SensorContactsDs implements DataSource<SensorContactTable> {

  private static contactsSubject: BehaviorSubject<SensorContactTable[]> = new BehaviorSubject([]);
  private contacts: SensorContactTable [] = [];

  constructor(private mqttService: MqttAdapterService) {

  }


  connect(collectionViewer: CollectionViewer): Observable<SensorContactTable[]> {
    console.log('Subscribing ...');
    this.mqttService.subscribe();
    MqttAdapterService.currentEvents.subscribe((sEs: StoneEvent []) => {
      this.contacts = [];
      if (sEs) {
        sEs.forEach((v: StoneEvent) => {
          this.updateContacts(v);
        });
      }
    });

    // Update every 5s
    interval(5000).subscribe(() => this.emit());
    return SensorContactsDs.contactsSubject;
  }


  disconnect(collectionViewer: CollectionViewer): void {
    SensorContactsDs.contactsSubject.complete();
    this.mqttService.unsubscibe();
    MqttAdapterService.currentEvents.unsubscribe();
  }

  private emit() {
    console.log('Emitting', this.contacts);
    SensorContactsDs.contactsSubject.next(this.contacts);
  }

  private updateContacts(stoneEvent: StoneEvent) {
    const stone = `(${stoneEvent.major},${stoneEvent.minor})`;
    const stmp = stoneEvent.timestmp;

    stoneEvent.data.forEach( (obs: Observation) => {
      const contact = new SensorContactTable();
      if (obs.minor) {
        contact.subject = `${obs.major} / ${obs.minor} / ${obs.uuid}`;
      } else {
        contact.subject = `${obs.mac}`;
      }
      contact.rssi = `${obs.min} / ${obs.max} /${obs.avg} / ${obs.remoteRssi}`;
      contact.stone = stone;
      contact.timestmp = stmp;
      this.contacts.unshift(contact);
      }
    );
  }
}
