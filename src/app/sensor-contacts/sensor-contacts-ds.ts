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

  private contactsSubject: EventEmitter<SensorContactTable[]> = new EventEmitter();
  private contacts: SensorContactTable [] = [];

  constructor(private mqttService: MqttAdapterService) {

  }


  connect(collectionViewer: CollectionViewer): Observable<SensorContactTable[]> {

    MqttAdapterService.stones().subscribe((stoneEvent: StoneEvent) => {
      // const contact: SensorContactTable = new SensorContactTable();
     const stone = `(${stoneEvent.major},${stoneEvent.minor})`;
     const stmp = stoneEvent.timestmp;

      for (const uuid in stoneEvent.data) {
        const obs: Observation = stoneEvent.data[uuid];
        const contact = new SensorContactTable();
        if (obs.minor) {
          contact.subject = `${obs.major} / ${obs.minor} / ${uuid}`;
        } else {
          contact.subject = `- / - / ${uuid}`;
        }
        contact.rssi = `${obs.min} / ${obs.max} /${obs.avg} / ${obs.remoteRssi}`;
        contact.stone = stone;
        contact.timestmp = stmp;
        this.contacts.unshift(contact);
      }
      this.emit();
    });
    // Update every 10s at least
    interval(10000).subscribe(() => this.emit());
    return this.contactsSubject;
  }

  disconnect(collectionViewer: CollectionViewer): void {
    this.contactsSubject.complete();
    this.mqttService.unsubscibe();
  }

  private emit() {
      this.contactsSubject.emit(this.contacts);
      console.log('Emitting:', this.contacts);
  }
}
