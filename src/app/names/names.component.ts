import { MatDialogRef } from '@angular/material';
/*
This file is part of fieldmon - (C) The Fieldtracks Project

    fieldmon is distributed under the civilian open source license (COSLi).
    Military usage is forbidden.

    You should have received a copy of COLi along with fieldmon.
    If not, please contact info@fieldtracks.org

 */
import {Component, OnDestroy, OnInit} from '@angular/core';
import { MqttAdapterService } from '../mqtt-adapter.service';
import { NamesDs } from './names-ds';
import { MatDialog } from '@angular/material';
import { NamesDialogComponent } from './names-dialog';
import { Names } from '../model/Names';
import { filter } from 'rxjs/operators';
import {HeaderBarService} from '../header-bar.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-names',
  templateUrl: './names.component.html',
  styleUrls: ['./names.component.css'],
})
export class NamesComponent implements OnInit {

  public readonly ownUUID = '';
  private _refresh: boolean;
  displayedColumns = ['type', 'reception', 'id', 'name', 'hardware', 'note'];
  private namesDialogRef: MatDialogRef<NamesDialogComponent>;
  private refreshSubscription: Subscription;

  constructor(private mqttAdapter: MqttAdapterService, public datasource: NamesDs, private dialog: MatDialog, private headerBarService: HeaderBarService) {
    this._refresh = true;
  }

  toggleRefresh(): void {
    if (this._refresh) {
      this.datasource.pause();
    } else {
      this.datasource.resume();
    }
    this._refresh = !this._refresh;
  }

  setFocused(mac: string): void {
    NamesDs.focus = mac;
  }


  ngOnInit() {
    this.headerBarService.refreshingEnabled.next(true);
    this.headerBarService.currentConfiguration.next(
      {sectionTitle: 'Names', showRefresh: true, showSearch: true});
    setTimeout( () => {
      this.headerBarService.rotateRefreshButton.next();
    }, 2000);
  }

  private openDialog(subject: Names) {
    this.namesDialogRef = this.dialog.open(NamesDialogComponent, {
      hasBackdrop: false,
      data: {
        name: subject.Name
      }
    });

    this.namesDialogRef.afterClosed().pipe(filter(name => name)).subscribe(name => {
      this.publishName(subject.Mac, name);
      subject.Name = name;
    });
  }

  private publishName(mac: String, name: String): void {
    console.log(`Publish: ${mac}, ${name}`);
    this.mqttAdapter.publishName(mac, name);
  }

}
