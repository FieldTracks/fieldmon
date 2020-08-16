/*
This file is part of fieldmon - (C) The Fieldtracks Project

    fieldmon is distributed under the civilian open source license (COSLi).
    Military usage is forbidden.

    You should have received a copy of COLi along with fieldmon.
    If not, please contact info@fieldtracks.org

 */
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MqttAdapterService } from '../mqtt-adapter.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { NamesDialogComponent } from './names-dialog';
import { filter } from 'rxjs/operators';
import { HeaderBarService } from '../header-bar.service';
import { Subscription } from 'rxjs';
import { NameInTable } from '../model/name-in-table';
import {environment} from '../../environments/environment';
import {StoneService} from '../stone.service';
import {FmComponent, HeaderBarConfiguration} from '../helpers/fm-component';

@Component({
  selector: 'app-names',
  templateUrl: './names.component.html',
  styleUrls: ['./names.component.css'],
})
export class NamesComponent implements OnInit, OnDestroy, FmComponent {

  private readonly ownUUID = environment.uuid;

  private refresh: boolean;
  displayedColumns = ['type', 'id', 'name', 'note'];
  private namesDialogRef: MatDialogRef<NamesDialogComponent>;
  private refreshButtonSubscription: Subscription;
  private searchSubscription: Subscription;
  private nameSubscription: Subscription;
  datasource = new MatTableDataSource<NameInTable>();
  private data: NameInTable[] = [];
  private filter: string;
  private stonesSubscription: Subscription;

  constructor(private mqttAdapter: MqttAdapterService,
              private dialog: MatDialog,
              private headerBarService: HeaderBarService,
              private stoneService: StoneService) { }

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  ngOnInit() {
    this.headerBarService.refreshEnabled(true);

    this.refreshButtonSubscription =  this.headerBarService.refreshingEnabled.subscribe(refresh => {
      this.refreshEnabled(refresh);
    });

    this.stonesSubscription = this.stoneService.knownDevices.subscribe( (devs) => {

      const newData = [];
      // @ts-ignore
      devs.forEach( (dev, mac) => {
        newData.unshift(new NameInTable(mac, dev.major, dev.minor, dev.uuid, dev.comment, this.stoneService.nameStatic(mac), dev.interval));
      });
      this.data = newData;
      this.triggerRefresh();

    });
    this.searchSubscription = this.headerBarService.searchEntered.subscribe((searchString) => {
      this.filter = searchString;
      this.datasource.filter = this.filter;
    });

    this.nameSubscription = this.stoneService.names.subscribe( (names) => {
      this.data.forEach( (nameInTable) => {
        nameInTable.name = names.get(nameInTable.mac);
      });

      this.triggerRefresh();
    });
  }

  ngOnDestroy() {
    this.refreshButtonSubscription.unsubscribe();
    this.searchSubscription.unsubscribe();
    this.stonesSubscription.unsubscribe();
  }

  openDialog(subject: NameInTable) {
    if (this.namesDialogRef) {
      return;
    }
    this.namesDialogRef = this.dialog.open(NamesDialogComponent, {
      hasBackdrop: false,
      data: {
        subject: subject,
        name: subject.name,
      }
    });

    const subscription = this.namesDialogRef.afterClosed().pipe(filter(name => name !== null)).subscribe(name => {
      this.mqttAdapter.publishName(subject.mac, name);
      subject.name = name;
    });

    const closeSubscription = this.namesDialogRef.afterClosed().subscribe(() => {
      subscription.unsubscribe();
      closeSubscription.unsubscribe();
      this.namesDialogRef = null;
    });
  }

  private refreshEnabled(refresh: boolean) {
    this.refresh = refresh;
    this.triggerRefresh();
  }

  private triggerRefresh() {
    if (this.refresh) {
      this.headerBarService.rotateRefreshButton.next();
      this.datasource.data = this.data;
    }

  }

  fmHeader(): HeaderBarConfiguration {
    return {sectionTitle: 'Names', showSearch: true, showRefresh: true};
  }
}
