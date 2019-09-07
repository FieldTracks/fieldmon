import { WebdavService } from './../webdav.service';
/*
This file is part of fieldmon - (C) The Fieldtracks Project
    fieldmon is distributed under the civilian open source license (COSLi).
    Military usage is forbidden.
    You should have received a copy of COLi along with fieldmon.
    If not, please contact info@fieldtracks.org
 */
import {AfterContentInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MqttAdapterService} from '../mqtt-adapter.service';
import {Subscription} from 'rxjs';
import {StoneService} from '../stone.service';
import {FmComponent, HeaderBarConfiguration, MenuItem} from '../helpers/fm-component';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import {HeaderBarService} from '../header-bar.service';
import {FileUploadDialogComponent} from './file-upload-dialog.component';
import {filter} from 'rxjs/operators';
import {FieldmonConfig} from '../model/configuration/fieldmon-config';
import {SettingsDialogComponent} from './settings-dialog/settings-dialog.component';
import {ConfigService} from '../config.service';
import {GraphConfig, GraphConfigService} from '../graph-config.service';


@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.css']
})
export class GraphComponent implements OnInit, AfterContentInit, OnDestroy, FmComponent {
  private configSubscription: Subscription;
  private graphConfigSubscription: Subscription;


  private fieldmonConfig: FieldmonConfig;

  private uploadDialogRef: MatDialogRef<FileUploadDialogComponent>;
  private settingsDialogRef: MatDialogRef<SettingsDialogComponent>;


  @ViewChild('menu', { static: true })
  private myMenu;
  graphConfig: GraphConfig;

  constructor(private snackBar: MatSnackBar,
              private mqttService: MqttAdapterService,
              private stoneService: StoneService,
              private bottomSheet: MatBottomSheet,
              private headerBarService: HeaderBarService,
              private dialog: MatDialog,
              private webdav: WebdavService,
              private configService: ConfigService,
              private graphConfigService: GraphConfigService) {

  }


  ngOnInit(): void {
    this.configSubscription = this.configService.currentConfiguration().subscribe( (fmc) => {
      this.fieldmonConfig = fmc;
    });
    this.graphConfigSubscription = this.graphConfigService.currentConfig.subscribe( (gc) => {
      this.graphConfig = gc;
    });
  }

  ngOnDestroy(): void {
    if (this.uploadDialogRef) {
      this.uploadDialogRef.close();
    }
    if (this.settingsDialogRef ) {
      this.settingsDialogRef.close();
    }
    if (this.configSubscription) {
      this.configSubscription.unsubscribe();
    }
    if (this.graphConfigSubscription) {
      this.graphConfigSubscription.unsubscribe();
    }
  }

  /**
   * Do not update the graph, befor all components are loaded.
   * Then do so every 2 seconds
   */
  ngAfterContentInit(): void {
    this.headerBarService.setMatMenu(this.myMenu);
    // this.d3Widget.run();
  }

  fmHeader(): HeaderBarConfiguration {
    return {sectionTitle: 'Graph', showRefresh: true, showSearch: true};
  }

  openSettingsDialog() {
    if (this.settingsDialogRef) {
      return;
    }
    this.settingsDialogRef = this.dialog.open(SettingsDialogComponent, {
      hasBackdrop: false,
    });

    const subscription = this.settingsDialogRef.afterClosed().pipe(filter((val) => val)).subscribe(image => {
      subscription.unsubscribe();
    });


    const closeSubscription = this.settingsDialogRef.afterClosed().subscribe(() => {
      closeSubscription.unsubscribe();
      this.settingsDialogRef = null;
    });
  }

  openDialog() {
    if (this.uploadDialogRef) {
      return;
    }
    this.uploadDialogRef = this.dialog.open(FileUploadDialogComponent, {
      hasBackdrop: false,
    });

    const subscription = this.uploadDialogRef.afterClosed().pipe(filter((val) => val)).subscribe(image => {
      subscription.unsubscribe();
      this.fieldmonConfig.backgroundImage = image;
      this.configService.submitConfiguration(this.fieldmonConfig);
    });


    const closeSubscription = this.uploadDialogRef.afterClosed().subscribe(() => {
      closeSubscription.unsubscribe();
      this.uploadDialogRef = null;
    });
  }

  showUnnamed(v: boolean) {
    this.graphConfig.showUnnamned = v;
    this.graphConfigService.currentConfig.next(this.graphConfig);
  }

  showLastContact(v: boolean) {
    this.graphConfig.showLastContacts = v;
    this.graphConfigService.currentConfig.next(this.graphConfig);
  }
}

