import { MqttService } from 'ngx-mqtt';
/*
This file is part of fieldmon - (C) The Fieldtracks Project

    fieldmon is distributed under the civilian open source license (COSLi).
    Military usage is forbidden.

    You should have received a copy of COLi along with fieldmon.
    If not, please contact info@fieldtracks.org

 */
import { Component, OnInit, ViewChild } from '@angular/core';
import { HeaderBarService } from '../header-bar.service';
import { Subscription } from 'rxjs';
import { MatTableDataSource, MatSort, MatPaginator } from '@angular/material';
import { MqttAdapterService } from '../mqtt-adapter.service';
import { StoneEvent } from '../model/StoneEvent';

@Component({
  selector: 'app-sensor-contacts',
  templateUrl: './sensor-contacts.component.html',
  styleUrls: ['./sensor-contacts.component.css']
})
export class SensorContactsComponent implements OnInit {

  displayedColumns = ['subject', 'stone', 'rssi', 'age', 'timestamp'];
  datasource = new MatTableDataSource<StoneEvent>();
  private events: StoneEvent[];
  private pageSizeOptions = [5, 10, 0];
  private subscription: Subscription;
  private filter: string;

  constructor(private mqttAdapter: MqttAdapterService, private titleService: HeaderBarService) { }

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  ngOnInit() {
    this.titleService.currentConfiguration.next({sectionTitle: 'Sensor Contacts', showSearch: true});

    this.subscription = this.mqttAdapter.stoneEventSubject().subscribe( (event) => {
      const index = this.events.findIndex((value: StoneEvent) => {
        return value.major === event.major && value.minor === event.minor;
      });
      if (index === -1) {

      } else {

      }

      this.pageSizeOptions = [5, 10, this.events.length];
      this.datasource = new MatTableDataSource(this.events);
      this.datasource.paginator = this.paginator;
      this.datasource.sort = this.sort;
      this.datasource.filter = this.filter;
    });

  }

  applyFilter(filterValue: string) {
    this.filter = filterValue.trim().toLowerCase();
    this.datasource.filter = this.filter;
  }
}
