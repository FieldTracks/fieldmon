import { MqttService } from 'ngx-mqtt';
/*
This file is part of fieldmon - (C) The Fieldtracks Project

    fieldmon is distributed under the civilian open source license (COSLi).
    Military usage is forbidden.

    You should have received a copy of COLi along with fieldmon.
    If not, please contact info@fieldtracks.org

 */
import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { HeaderBarService } from '../header-bar.service';
import { Subscription } from 'rxjs';
import { MatTableDataSource, MatSort, MatPaginator } from '@angular/material';
import { MqttAdapterService } from '../mqtt-adapter.service';
import { StoneEvent, Observation } from '../model/StoneEvent';
import { SensorContactTable } from '../model/sensor-contact-table';

@Component({
  selector: 'app-sensor-contacts',
  templateUrl: './sensor-contacts.component.html',
  styleUrls: ['./sensor-contacts.component.css']
})
export class SensorContactsComponent implements OnInit, OnDestroy {

  displayedColumns = ['subject', 'stone', 'rssi', 'age', 'timestamp'];
  datasource = new MatTableDataSource<SensorContactTable>();
  private contacts: SensorContactTable[] = [];
  private pageSizeOptions = [5, 10, 0];
  private subscription: Subscription;
  private filter: string;

  constructor(private mqttAdapter: MqttAdapterService, private titleService: HeaderBarService) { }

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  ngOnInit() {
    this.titleService.currentConfiguration.next({sectionTitle: 'Sensor Contacts', showSearch: true});

    this.subscription = this.mqttAdapter.stoneEventSubject().subscribe((event: StoneEvent) => {
      const stone = `(${event.major},${event.minor})`;
      const stmp = event.timestamp;

      event.data.forEach( (obs: Observation) => {
          const contact = new SensorContactTable();
          if (obs.minor) {
              contact.subject = `${obs.major} / ${obs.minor} / ${obs.uuid}`;
          } else {
              contact.subject = `${obs.mac}`;
          }

          const element: SensorContactTable = (this.contacts.find(elem => elem.subject === contact.subject));
          if (element !== undefined) {
              element.timestamp = stmp;
              return;
          }

          contact.rssi = `${obs.min} / ${obs.max} /${obs.avg} / ${obs.remoteRssi}`;
          contact.stone = stone;
          contact.timestamp = stmp;
          this.contacts.unshift(contact);
      });

      this.pageSizeOptions = [5, 10, this.contacts.length];
      this.datasource = new MatTableDataSource(this.contacts);
      this.datasource.paginator = this.paginator;
      this.datasource.sort = this.sort;
      this.datasource.filter = this.filter;
    });

  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  applyFilter(filterValue: string) {
    this.filter = filterValue.trim().toLowerCase();
    this.datasource.filter = this.filter;
  }
}
