/*
This file is part of fieldmon - (C) The Fieldtracks Project

    fieldmon is distributed under the civilian open source license (COSLi).
    Military usage is forbidden.

    You should have received a copy of COLi along with fieldmon.
    If not, please contact info@fieldtracks.org

 */
import { Component, OnInit } from '@angular/core';
import { SensorContactsDs } from './sensor-contacts-ds';
import {HeaderBarService} from '../header-bar.service';

@Component({
  selector: 'app-sensor-contacts',
  templateUrl: './sensor-contacts.component.html',
  styleUrls: ['./sensor-contacts.component.css']
})
export class SensorContactsComponent implements OnInit {

  displayedColumns = ['subject', 'stone', 'rssi', 'age', 'timestamp'];

  constructor(private datasource: SensorContactsDs, private titleService: HeaderBarService) { }

  ngOnInit() {
    this.titleService.currentConfiguration.next({sectionTitle: 'Sensor Contacts', showSearch: true});
  }
}
