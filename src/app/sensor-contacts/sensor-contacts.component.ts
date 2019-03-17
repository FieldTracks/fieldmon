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
import {interval, Observable, Subscription} from 'rxjs';
import { MatTableDataSource, MatSort, MatPaginator } from '@angular/material';
import { MqttAdapterService } from '../mqtt-adapter.service';
import { StoneEvent, Observation } from '../model/StoneEvent';
import { SensorContactTable } from '../model/sensor-contact-table';
import {StoneService} from '../stone.service';

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
  private refreshSubscription: Subscription;

  constructor(private mqttAdapter: MqttAdapterService, private titleService: HeaderBarService, private stoneService: StoneService) { }

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  ngOnInit() {
    this.pageSizeOptions = [5, 10, this.contacts.length];
    this.datasource = new MatTableDataSource(this.contacts);
    this.datasource.paginator = this.paginator;
    this.datasource.sort = this.sort;
    this.datasource.filter = this.filter;

    this.refreshSubscription = interval(2000).subscribe(() => {
      this.datasource.data = this.contacts;
    });

    this.subscription = this.mqttAdapter.stoneEventSubject().subscribe((event: StoneEvent) => {
      this.handleStoneEvent(event);
    });

  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }
  applyFilter(filterValue: string) {
    this.filter = filterValue.trim().toLowerCase();
    this.datasource.filter = this.filter;
  }

  private subject(obs: Observation): string {
    const name = this.stoneService.name(obs.mac);
    console.log('Got name:', name);
    if (name) {
      return name;
    } else if (obs.minor) {
      return `${obs.major} / ${obs.minor} / ${obs.uuid}`;
    } else {
      return  `${obs.mac}`;
    }
  }

  private handleStoneEvent(event: StoneEvent) {
    event.data.forEach( (obs: Observation) => {
      let contact = this.contacts.find( (c) => c.mac === obs.mac && c.observer === event.mac);
      if (!contact) {
        contact = new SensorContactTable(obs.mac, event.mac);
        this.contacts.unshift(contact);
      }
      contact.timestamp =  event.timestamp;
      contact.subject = this.subject(obs);
      contact.rssi = `${obs.min} / ${obs.max} /${obs.avg} / ${obs.remoteRssi}`;
      contact.stone = this.stoneService.name(event.mac) || `${event.major}, ${event.minor}`;
      this.datasource.data = this.contacts;
    });

  }
}
