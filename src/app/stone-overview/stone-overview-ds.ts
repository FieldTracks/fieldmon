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
import {BehaviorSubject, interval, Observable} from 'rxjs';

export class StoneOverviewDs implements DataSource<StoneInTable> {

  private static stonesSubject: BehaviorSubject<StoneInTable[]> = new BehaviorSubject([]);
  private stones: StoneInTable [] = [];

  constructor(private mqttService: MqttAdapterService) {

  }


  connect(collectionViewer: CollectionViewer): Observable<StoneInTable[]> {

    this.mqttService.subscribe();
    MqttAdapterService.currentEvents.subscribe( (sEs: StoneEvent []) => {
      sEs.forEach((sE: StoneEvent) => {
        this.updateStones(sE);
      });
    this.emit();
    });

    // Update every 10s at least
    interval(10000).subscribe(() => this.emit());
    return StoneOverviewDs.stonesSubject;
  }

  disconnect(collectionViewer: CollectionViewer): void {
    StoneOverviewDs.stonesSubject.complete();
    this.mqttService.unsubscibe();
  }

  private emit() {
    StoneOverviewDs.stonesSubject.next(this.stones);
  }

  private updateStones(sE: StoneEvent) {
    for (const s of this.stones) {
      if (s.uuid === sE.uuid && s.major === sE.major && s.minor === sE.minor) {
        s.lastSeen = sE.timestmp;
        return;
      } else {
      }
    }
    const stone: StoneInTable = new StoneInTable(sE.comment, sE.uuid, sE.major, sE.minor, sE.timestmp);
    this.stones.push(stone);
  }
}
