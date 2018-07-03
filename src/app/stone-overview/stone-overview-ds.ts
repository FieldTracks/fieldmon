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
import {interval, Observable} from 'rxjs';

export class StoneOverviewDs implements DataSource<StoneInTable> {

  private stonesSubject: EventEmitter<StoneInTable[]> = new EventEmitter();
  private stones: StoneInTable [] = [];

  constructor(private mqttService: MqttAdapterService) {

  }


  connect(collectionViewer: CollectionViewer): Observable<StoneInTable[]> {

    MqttAdapterService.stones().subscribe((stoneEvent: StoneEvent) => {
      for (const s of this.stones) {
        if (s.uuid === stoneEvent.uuid && s.major === stoneEvent.major && s.minor === stoneEvent.minor) {
          s.lastSeen = stoneEvent.timestmp;
          this.emit();
          return;
        } else {
        }
      }
      const stone: StoneInTable = new StoneInTable(stoneEvent.comment, stoneEvent.uuid, stoneEvent.major, stoneEvent.minor, stoneEvent.timestmp);
      this.stones.push(stone);
      this.emit();
    });
    // Update every 10s at least
    interval(10000).subscribe(() => this.emit());
    return this.stonesSubject;
  }

  disconnect(collectionViewer: CollectionViewer): void {
    this.stonesSubject.complete();
    this.mqttService.unsubscibe();
  }

  private emit() {
      this.stonesSubject.emit(this.stones);
      console.log('Emitting:', this.stones);
  }
}
