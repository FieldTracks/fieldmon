/*
This file is part of fieldmon - (C) The Fieldtracks Project

    fieldmon is distributed under the civilian open source license (COSLi).
    Military usage is forbidden.

    You should have received a copy of COLi along with fieldmon.
    If not, please contact info@fieldtracks.org

 */
import { Component, OnInit, OnDestroy } from '@angular/core';
import {MqttAdapterService} from '../mqtt-adapter.service';
import {StoneEvent} from '../model/StoneEvent';
import {StoneInTable} from '../model/stone-in-table';
import {DataSource } from '@angular/cdk/collections';
import { StoneOverviewDs } from './stone-overview-ds';


@Component({
  selector: 'app-stone-overview',
  templateUrl: './stone-overview.component.html',
  styleUrls: ['./stone-overview.component.css']
})
export class StoneOverviewComponent implements OnInit, OnDestroy {

  datasource: DataSource<StoneInTable>;

  displayedColumns = ['major', 'minor', 'comment', 'age', 'lastSeen', 'uuid'];

  constructor(private mqttAdapter: MqttAdapterService) {
    this.datasource = new StoneOverviewDs(mqttAdapter);
  }


  ngOnInit() {
  }

  ngOnDestroy(){
    this.datasource.disconnect(null);
  }

}

