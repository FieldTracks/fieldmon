/*
This file is part of fieldmon - (C) The Fieldtracks Project

    fieldmon is distributed under the civilian open source license (COSLi).
    Military usage is forbidden.

    You should have received a copy of COLi along with fieldmon.
    If not, please contact info@fieldtracks.org

 */
import { Component, OnInit } from '@angular/core';
import {DataSource} from '@angular/cdk/collections';
import {MqttAdapterService} from '../mqtt-adapter.service';
import { Subscription } from 'rxjs';
import { IMqttClient, IMqttMessage } from 'ngx-mqtt';
import { Names } from '../model/Names';
import { NamesDs } from './names-ds';

@Component({
  selector: 'app-names',
  templateUrl: './names.component.html',
  styleUrls: ['./names.component.css']
})
export class NamesComponent implements OnInit {

  private _refresh: Boolean;
  private _subscription: Subscription;
  private datasource: DataSource<NamesDs>;
  displayedColumns = ['Major / Minor', 'UUID', 'Mac', 'Name', 'Submit'];

  constructor() {
    this._refresh = true;
    /*this._subscription = MqttAdapterService.getSubscription('/Aggregated/Stones', (message: IMqttMessage) => {
      
    });*/
  }



  refresh(): void {
    //this.datasource.emit();
  }

  toggleRefresh(): void {
    this._refresh = !this._refresh;
  }

  submitName(name: String): void {
    alert(name);
  }

  ngOnInit() {
  }

  private publishName(mac: String, name: String): void {
    // mqttService.currentEvents
  }

}
