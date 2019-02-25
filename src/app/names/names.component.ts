/*
This file is part of fieldmon - (C) The Fieldtracks Project

    fieldmon is distributed under the civilian open source license (COSLi).
    Military usage is forbidden.

    You should have received a copy of COLi along with fieldmon.
    If not, please contact info@fieldtracks.org

 */
import { Component, OnInit, OnDestroy } from '@angular/core';
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
export class NamesComponent implements OnInit, OnDestroy {

  public readonly ownUUID = '';
  datasource: NamesDs;
  private _refresh: boolean;
  displayedColumns = ['type', 'reception', 'id', 'name', 'hardware', 'note'];

  constructor(private mqttAdapter: MqttAdapterService) {
    this.datasource = new NamesDs(mqttAdapter);
    this._refresh = true;
  }

  refresh(): void {
    this.datasource.emit();
  }

  toggleRefresh(): void {
    if (this._refresh) {
      this.datasource.pause();
    } else {
      this.datasource.resume();
    }
    this._refresh = !this._refresh;
  }

  setFocused(mac: string): void {
    NamesDs.focus = mac;
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.datasource.disconnect(null);
  }

  private publishName(mac: String, name: String): void {
    this.mqttAdapter.publishName(mac, name);
  }

}
