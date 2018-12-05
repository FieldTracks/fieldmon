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
import {SensorContactTable} from '../model/sensor-contact-table';
import {SensorContactsDs} from './sensor-contacts-ds';
import { GDataSource } from '../helpers/GDataSource';

@Component({
  selector: 'app-sensor-contacts',
  templateUrl: './sensor-contacts.component.html',
  styleUrls: ['./sensor-contacts.component.css']
})
export class SensorContactsComponent implements OnInit, OnDestroy {

  datasource: GDataSource<SensorContactTable>;

  displayedColumns = ['subject', 'stone', 'rssi', 'age', 'timestamp'];

  constructor(private mqttAdapter: MqttAdapterService) {
    this.datasource = new SensorContactsDs(mqttAdapter);
  }


  ngOnInit() {
  }

  ngOnDestroy(){
    this.datasource.disconnect(null);
  }

}