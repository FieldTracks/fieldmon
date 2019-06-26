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
import {GraphNG} from './graph.model';
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


@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.css']
})
export class GraphComponent implements OnInit, AfterContentInit, OnDestroy, FmComponent {
  private d3Widget = new D3Widget(this.bottomSheet);
  private subscription: Subscription;
  private configSubscription: Subscription;
  private fieldmonConfig: FieldmonConfig;

  private dialogRef: MatDialogRef<FileUploadDialogComponent>;


  @ViewChild('menu', { static: true })
  private myMenu;

  private graph = new GraphNG();

  constructor(private snackBar: MatSnackBar,
              private mqttService: MqttAdapterService,
              private stoneService: StoneService,
              private bottomSheet: MatBottomSheet,
              private headerBarService: HeaderBarService,
              private dialog: MatDialog) {

  }


  ngOnInit(): void {

  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if(this.dialogRef) {
      this.dialogRef.close();
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
      console.dir(ag.links);
      this.d3Widget.updateGraphNg(this.graph);
    });
    this.configSubscription = this.mqttService.fieldmonSubject().subscribe( (fmc) => {
      this.fieldmonConfig = fmc;
      D3Widget.imageURL(fmc.backgroundImage);

    });
  }

  fmHeader(): HeaderBarConfiguration {
    return {sectionTitle: 'Graph', showRefresh: true, showSearch: true};
  }

  openDialog() {
    if (this.dialogRef) {
      return;
    }
    this.dialogRef = this.dialog.open(FileUploadDialogComponent, {
      hasBackdrop: false,
    });

    const subscription = this.dialogRef.afterClosed().pipe(filter((val) => val)).subscribe(image => {
      this.mqttService.publishFieldmonConfig({
          backgroundImage: image
        });
    });


    const closeSubscription = this.dialogRef.afterClosed().subscribe(() => {
      closeSubscription.unsubscribe();
      this.dialogRef = null;
    });
  }
}

