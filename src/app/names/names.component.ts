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
import {SensorContactTable} from '../model/sensor-contact-table';
import {SensorContactsDs} from './names-ds';

@Component({
  selector: 'app-names',
  templateUrl: './names.component.html',
  styleUrls: ['./names.component.css']
})
export class NamesComponent implements OnInit {

  datasource: SensorContactsDs;

  displayedColumns = ['Major / Minor', 'UUID', 'Mac', 'Name', 'Submit'];

  constructor(private mqttAdapter: MqttAdapterService) {
    this.datasource = new SensorContactsDs(mqttAdapter);
  }

  refresh(): void {
    this.datasource.emit();
  }

  toggleRefresh(): void {
    this.datasource.autoRefresh = !this.datasource.autoRefresh;
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
