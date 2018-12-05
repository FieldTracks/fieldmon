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

  private datasource: NamesDs;
  private _refresh: boolean;
  displayedColumns = ['Major / Minor', 'UUID', 'Mac', 'Name', 'Submit'];

  constructor(private mqttAdapter: MqttAdapterService) {
    this.datasource = new NamesDs(mqttAdapter);
    this._refresh = true;
  }



  refresh(): void {
    this.datasource.emit();
  }

  toggleRefresh(): void {
    if(this._refresh){
      this.datasource.pause();
    }else{
      this.datasource.resume();
    }
    this._refresh = !this._refresh;
  }

  submitName(name: String): void {
    alert(name);
  }

  ngOnInit() {
  }

  ngOnDestroy(){
    this.datasource.disconnect(null);
  }

  private publishName(mac: String, name: String): void {
    // mqttService.currentEvents
  }

}
