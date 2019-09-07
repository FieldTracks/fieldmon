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
import {D3Widget} from './d3-widget';
import {Subscription} from 'rxjs';
import {GraphNG, D3Node} from './graph.model';
import {StoneService} from '../stone.service';
import {FmComponent, HeaderBarConfiguration, MenuItem} from '../helpers/fm-component';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatMenu } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';
import {HeaderBarService} from '../header-bar.service';
import {FileUploadDialogComponent} from './file-upload-dialog.component';
import {NameInTable} from '../model/name-in-table';
import {NamesDialogComponent} from '../names/names-dialog';
import {filter} from 'rxjs/operators';
import {FieldmonConfig} from '../model/configuration/fieldmon-config';
import {SettingsDialogComponent} from './settings-dialog/settings-dialog.component';
import {ConfigService} from '../config.service';


@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.css']
})
export class GraphComponent implements OnInit, AfterContentInit, OnDestroy, FmComponent {
  private graph: GraphNG;
  private d3Widget: D3Widget;
  private subscription: Subscription;
  private configSubscription: Subscription;
  private positionChangeSubscription: Subscription;
  private fieldmonConfig: FieldmonConfig;

  private uploadDialogRef: MatDialogRef<FileUploadDialogComponent>;
  private settingsDialogRef: MatDialogRef<SettingsDialogComponent>;

  showUnnamedContacts = true;
  showLastContact = true;

  @ViewChild('menu', { static: true })
  private myMenu;

  constructor(private snackBar: MatSnackBar,
              private mqttService: MqttAdapterService,
              private stoneService: StoneService,
              private bottomSheet: MatBottomSheet,
              private headerBarService: HeaderBarService,
              private dialog: MatDialog,
              private webdav: WebdavService,
              private configService: ConfigService) {
    this.graph = new GraphNG(webdav);
    this.d3Widget = new D3Widget(this.bottomSheet, this.graph);

  }


  ngOnInit(): void {
    this.positionChangeSubscription = this.graph.manualPositionChange.subscribe(() => {
      this.pulishConfig();
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.uploadDialogRef) {
      this.uploadDialogRef.close();
    }
    if (this.positionChangeSubscription) {
      this.positionChangeSubscription.unsubscribe();
    }
    if (this.configSubscription) {
      this.configSubscription.unsubscribe();
    }
  }

  /**
   * Do not update the graph, befor all components are loaded.
   * Then do so every 2 seconds
   */
  ngAfterContentInit(): void {
    this.headerBarService.setMatMenu(this.myMenu);
    this.d3Widget.run();
    this.subscription = this.mqttService.aggregatedGraphSubject().subscribe( (ag) => {
      this.graph.updateData(ag, this.stoneService.names.getValue());
      this.d3Widget.refresh();
    });
    this.configSubscription = this.configService.currentConfiguration().subscribe( (fmc) => {
      this.fieldmonConfig = fmc;
      if (this.graph.backgroundUrl !== fmc.backgroundImage) {
        this.graph.backgroundUrl = fmc.backgroundImage;
      }
      this.graph.onRemoteNodeChange(fmc.fixedNodes);
      this.d3Widget.refresh();
    });
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
      // this.graph.backgroundUrl = image;
      // this.pulishConfig();
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
      this.graph.backgroundUrl = image;
      this.pulishConfig();
    });


    const closeSubscription = this.uploadDialogRef.afterClosed().subscribe(() => {
      closeSubscription.unsubscribe();
      this.uploadDialogRef = null;
    });
  }

  private pulishConfig() {
    this.fieldmonConfig.backgroundImage = this.graph.backgroundUrl;
    this.fieldmonConfig.fixedNodes = Array.from(this.graph.fixedNodes.values());
    this.configService.submitConfigration(this.fieldmonConfig);

  }
}

