<<<<<<< HEAD
import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MqttAdapterService} from '../../mqtt-adapter.service';
import {StoneOverviewDs} from '../../stone-overview/stone-overview-ds';
import {DataSource} from '@angular/cdk/typings/esm5/collections';
import {StoneInTable} from '../../model/stone-in-table';
import {BehaviorSubject, Subscription} from 'rxjs';
import {AggregatedStone} from '../../model/aggregated-stones/aggregated-stone';
import {MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
=======
import { Component, OnDestroy, OnInit } from '@angular/core';
import { StoneOverviewDs } from '../../stone-overview/stone-overview-ds';
import { NamesDs } from 'src/app/names/names-ds';
import { SensorContactsDs } from 'src/app/sensor-contacts/sensor-contacts-ds';
>>>>>>> fb3eaaca41cc2a8f3603c2ea47da16dd629ac4c5

@Component({
  selector: 'app-online',
  templateUrl: './online.component.html',
  styleUrls: ['./online.component.css']
})
export class OnlineComponent implements OnInit, OnDestroy {

<<<<<<< HEAD
  datasource = new MatTableDataSource<StoneInTable>();

  displayedColumns = ['major', 'minor', 'comment', 'age', 'lastSeen'];

  pageSizeOptions = [5, 10, 0];

  private subscription: Subscription;

  privateprivate;
  filter: string;


  constructor(private mqttAdapter: MqttAdapterService) {
    // this.datasource = new StoneOverviewDs(mqttAdapter);
  }

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  ngOnInit() {
    this.subscription = this.mqttAdapter.aggregatedStonesSubject().subscribe( (map) => {
      const newList: StoneInTable[] = [];
      for (const mac in map) {
        if (mac) {
          const aStone: AggregatedStone = map[mac];#
          newList.push(new StoneInTable(
            aStone.comment, aStone.uuid, aStone.major, aStone.minor, new Date(aStone.last_seen)));
        }
      }
      this.pageSizeOptions = [5, 10, newList.length];
      this.datasource = new MatTableDataSource(newList);
      this.datasource.paginator = this.paginator;
      this.datasource.sort = this.sort;
      this.datasource.filter = this.filter;
    });

  }

  applyFilter(filterValue: string) {
    this.filter = filterValue.trim().toLowerCase();
    this.datasource.filter = this.filter;
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }


}
