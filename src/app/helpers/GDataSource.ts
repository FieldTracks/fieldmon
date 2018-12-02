/*
This file is part of fieldmon - (C) The Fieldtracks Project

    fieldmon is distributed under the civilian open source license (COSLi).
    Military usage is forbidden.

    You should have received a copy of COLi along with fieldmon.
    If not, please contact info@fieldtracks.org

 */
import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { MqttAdapterService } from '../mqtt-adapter.service';
import { BehaviorSubject, interval, Observable, Subscription } from 'rxjs';
import { IMqttMessage } from 'ngx-mqtt';

export abstract class GDataSource<T> implements DataSource<T> {

  private Subject: BehaviorSubject<T[]>;
  private data: T [];
  private _subscription: Subscription;
  private _interval: Subscription;
  private _channel: string;
  protected abstract mqttService: MqttAdapterService;

  constructor(channel: string, data: T[]) {
    this._channel = channel;
    this.data = data;
    this.Subject = new BehaviorSubject([]);
  }


  connect(collectionViewer: CollectionViewer): Observable<T[]> {
    console.log('Subscribing ...');
    this.emit();

    this._subscription = this.mqttService.getSubscription(this._channel, this.parseMessage);

    // Update every 5s
    this._interval = interval(5000).subscribe(() => this.emit());
    return this.Subject;
  }

  protected abstract parseMessage(message: IMqttMessage): void;

  resume() {
    this.emit();
    this._interval = interval(5000).subscribe(() => this.emit());
  }

  pause() {
    this._interval.unsubscribe();
  }

  disconnect(collectionViewer: CollectionViewer): void {
    console.log("unsubscribing...");
    this._interval.unsubscribe();
    this._subscription.unsubscribe();
  }

  private emit() {
    console.log('Emitting', this.data);
    this.Subject.next(this.data);
  }
}