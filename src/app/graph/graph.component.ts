/*
This file is part of fieldmon - (C) The Fieldtracks Project

    fieldmon is distributed under the civilian open source license (COSLi).
    Military usage is forbidden.

    You should have received a copy of COLi along with fieldmon.
    If not, please contact info@fieldtracks.org

 */
import {AfterContentInit, Component, OnInit} from '@angular/core';
import {MqttAdapterService} from '../mqtt-adapter.service';
import {Graph} from '../model/Graph';
import {D3Widget} from './d3-widget';
import {interval} from 'rxjs';


@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.css']
})
export class GraphComponent implements OnInit, AfterContentInit {
  private d3Widget = new D3Widget();

  constructor(private mqttService: MqttAdapterService) {

  }

  /** Subscribe to event */
  ngOnInit(): void {
    this.mqttService.subscribe().subscribe((v) => {
      console.log('Got stone event', v);
      D3Widget.graph.addOrUdpateGraph(v);

    });
  }

  /**
   * Do not update the graph, befor all components are loaded.
   * Then do so every 2 seconds
   */
  ngAfterContentInit(): void {
    this.d3Widget.run();
    interval(5000).subscribe( () => {
      this.d3Widget.updateGraph();
      }
    );

  }



}
