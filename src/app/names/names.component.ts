/*
This file is part of fieldmon - (C) The Fieldtracks Project

    fieldmon is distributed under the civilian open source license (COSLi).
    Military usage is forbidden.

    You should have received a copy of COLi along with fieldmon.
    If not, please contact info@fieldtracks.org

 */
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MqttAdapterService } from '../mqtt-adapter.service';
import { MatDialog, MatDialogRef, MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { NamesDialogComponent } from './names-dialog';
import { AggregatedName } from '../model/aggregated/aggregated-name';
import { filter } from 'rxjs/operators';
import { HeaderBarService } from '../header-bar.service';
import { Subscription } from 'rxjs';
import { NameInTable } from '../model/name-in-table';
import { AggregatedStone } from '../model/aggregated/aggregated-stone';
import { callNgModuleLifecycle } from '@angular/core/src/view/ng_module';
import {environment} from '../../environments/environment';

@Component({
  selector: 'app-names',
  templateUrl: './names.component.html',
  styleUrls: ['./names.component.css'],
})
export class NamesComponent implements OnInit, OnDestroy {

  public readonly ownUUID = environment.uuid;
  private refresh: boolean;
  displayedColumns = ['type', 'reception', 'id', 'name', 'hardware', 'note'];
  private namesDialogRef: MatDialogRef<NamesDialogComponent>;
  private refreshSubscription: Subscription;
  private subscription: Subscription;
  private nameSubscription: Subscription;
  private searchSubscription: Subscription;
  datasource = new MatTableDataSource<NameInTable>();
  private data: NameInTable[] = [];
  pageSizeOptions = [5, 10, 0];
  private filter: string;

  constructor(private mqttAdapter: MqttAdapterService, private dialog: MatDialog, private headerBarService: HeaderBarService) { }

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  ngOnInit() {
    this.refresh = true;
    this.headerBarService.refreshingEnabled.next(this.refresh);
    this.headerBarService.currentConfiguration.next(
      {sectionTitle: 'Names', showRefresh: true, showSearch: true});

    this.refreshSubscription =  this.headerBarService.refreshingEnabled.subscribe(refresh => {
      this.refresh = refresh;
      if (this.refresh) {
        this.pageSizeOptions = [5, 10, this.data.length];
        this.datasource = new MatTableDataSource(this.data);
        this.datasource.paginator = this.paginator;
        this.datasource.sort = this.sort;
        this.datasource.filter = this.filter;
      }
    });

    this.subscription = this.mqttAdapter.aggregatedStonesSubject().subscribe((map) => {
      const newList: NameInTable[] = [];
      for (const mac in map) {
        if (mac) {
          const index = this.data.findIndex((value) => {
            return value.mac === mac;
          });
          const name = index !== -1 ? this.data[index].name : null;
          const stone: AggregatedStone = map[mac];
          const rssi: number = Math.max.apply(null, stone.contacts.map((value) => value.rssi_avg, 10));
          newList.push(new NameInTable(mac, stone.major, stone.minor, stone.uuid, rssi, stone.comment, name));
        }
      }
      this.data = newList;
      if (this.refresh) {
        this.pageSizeOptions = [5, 10, newList.length];
        this.datasource = new MatTableDataSource(newList);
        this.datasource.paginator = this.paginator;
        this.datasource.sort = this.sort;
        this.datasource.filter = this.filter;
      }
    });

    this.nameSubscription = this.mqttAdapter.aggregatedNamesSubject().subscribe((map) => {
      const newList: NameInTable[] = this.data;
      for (const mac in map) {
        if (mac) {
          const name: AggregatedName = map[mac];
          const index = newList.findIndex((value) => {
            return value.mac === mac;
          });
          if (index !== -1) {
            newList[index].name = name.name;
          }
        }
      }
      this.data = newList;
      if (this.refresh) {
        this.pageSizeOptions = [5, 10, newList.length];
        this.datasource = new MatTableDataSource(newList);
        this.datasource.paginator = this.paginator;
        this.datasource.sort = this.sort;
        this.datasource.filter = this.filter;
      }
    });

    this.searchSubscription = this.headerBarService.searchEntered.subscribe((searchString) => {
      this.filter = searchString;
      this.datasource.filter = this.filter;
    });

    setTimeout( () => {
      this.headerBarService.rotateRefreshButton.next();
    }, 2000);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.nameSubscription.unsubscribe();
    this.refreshSubscription.unsubscribe();
    this.searchSubscription.unsubscribe();
  }

  openDialog(subject: NameInTable) {
    if (this.namesDialogRef) {
      return;
    }
    this.namesDialogRef = this.dialog.open(NamesDialogComponent, {
      hasBackdrop: false,
      data: {
        name: subject.name,
        mac: subject.mac
      }
    });

    const subscription = this.namesDialogRef.afterClosed().pipe(filter(name => name !== null)).subscribe(name => {
      this.publishName(subject.mac, name);
      subject.name = name;
    });

    const closeSubscription = this.namesDialogRef.afterClosed().subscribe(() => {
      subscription.unsubscribe();
      closeSubscription.unsubscribe();
      this.namesDialogRef = null;
    });
  }

  applyFilter(filterValue: string) {
    this.filter = filterValue.trim().toLowerCase();
    this.datasource.filter = this.filter;
  }

  publishName(mac: String, name: String): void {
    console.log(`Publish: ${mac}, ${name}`);
    this.mqttAdapter.publishName(mac, name);
  }

  showSignalStrength(rssi: number, bar: number): boolean {
    switch (bar) {
      case 1: return rssi < -89;
      case 2: return rssi >= -89 && rssi < -85;
      case 3: return rssi >= -85 && rssi < -75;
      case 4: return rssi >= -75;
      default: return false;
    }
  }
}
