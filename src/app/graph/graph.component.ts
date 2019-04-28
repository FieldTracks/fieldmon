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
import {MatBottomSheet, MatMenu} from '@angular/material';
import {HeaderBarService} from '../header-bar.service';


@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.css']
})
export class GraphComponent implements OnInit, AfterContentInit, OnDestroy, FmComponent {
  private d3Widget = new D3Widget(this.bottomSheet);
  private subscription: Subscription;

  @ViewChild('menu')
  private myMenu;

  private graph = new GraphNG();

  constructor(private mqttService: MqttAdapterService, private stoneService: StoneService, private bottomSheet: MatBottomSheet, private headerBarService: HeaderBarService) {

  }


  ngOnInit(): void {

  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
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
      this.d3Widget.updateGraphNg(this.graph);
    });
  }

  fmHeader(): HeaderBarConfiguration {
    return {sectionTitle: 'Graph', showRefresh: true, showSearch: true};
  }

  fmMenuItems(): MenuItem[] {
    return [{name: 'Background', icon: 'layers', onClick: () => {
        console.log('Select background Image');
      }}];
  }

}

