/*
This file is part of fieldmon - (C) The Fieldtracks Project

    fieldmon is distributed under the civilian open source license (COSLi).
    Military usage is forbidden.

    You should have received a copy of COLi along with fieldmon.
    If not, please contact info@fieldtracks.org

 */
import {AfterContentInit, Component, OnInit} from '@angular/core';
import * as d3 from 'd3';
import {MqttAdapterService} from '../mqtt-adapter.service';
import {Graph, GraphLink} from '../model/Graph';

const data = {
  'nodes': [
    {'id': 'Myriel', 'group': 1},
    {'id': 'Napoleon', 'group': 1},
    {'id': 'Mlle.Baptistine', 'group': 1}
  ],
  'links': [
    {'source': 'Napoleon', 'target': 'Myriel', 'value': 1},
    {'source': 'Mlle.Baptistine', 'target': 'Myriel', 'value': 8}]
};

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.css']
})
export class GraphComponent implements OnInit, AfterContentInit  {

  constructor(private mqttService: MqttAdapterService) {

  }

  private svg;
  private width;
  private height;
  private simulation;
  private color;
  private graph: Graph = new Graph();

  ngOnInit(): void {
    this.mqttService.subscribe().subscribe( (sE) => {
      this.graph.addOrUdpateGraph(sE);
      if (this.simulation) {
        this.simulation.nodes(this.graph.codedNodes());
        this.simulation.links(this.graph.codedLinks());
      }
    });
  }

  ngAfterContentInit(): void {
    this.svg = d3.select('svg');
    this.width = + this.svg.attr('width');
    this.height = +this.svg.attr('height');

    this.color = d3.scaleOrdinal(d3.schemeCategory10);

    this.simulation = d3.forceSimulation()
      .force('link', d3.forceLink().id(function(d) { return d.id; }))
      .force('charge', d3.forceManyBody())
      .force('center', d3.forceCenter(this.width / 2, this.height / 2));

      const link = this.svg.append('g')
        .attr('class', 'links')
        .selectAll('line')
        .data(data.links)
        .enter().append('line')
        .attr('stroke-width', function(d) { return Math.sqrt(d.value); });

      const node = this.svg.append('g')
        .attr('class', 'nodes')
        .selectAll('circle')
        .data(data.nodes)
        .enter().append('circle')
        .attr('r', 5)
        .attr('fill', 'purple')
        .call(d3.drag()
          .on('start', this.createdragstarted())
          .on('drag', this.dragged)
          .on('end', this.createdragended()));

      node.append('title')
        .text(function(d) { return d.id; });

      this.simulation
        .nodes(data.nodes)
        .on('tick', ticked);

      this.simulation.force('link')
        .links(data.links);

      function ticked() {
        link
          .attr('x1', function(d) { return d.source.x; })
          .attr('y1', function(d) { return d.source.y; })
          .attr('x2', function(d) { return d.target.x; })
          .attr('y2', function(d) { return d.target.y; });

        node
          .attr('cx', function(d) { return d.x; })
          .attr('cy', function(d) { return d.y; });
      }
  }

  createdragstarted() {
    const that = this;
   return function (d): void {
      if (!d3.event.active) {
      that.simulation.alphaTarget(0.3).restart();
    }
    d.fx = d.x;
    d.fy = d.y;
  };
  }

  dragged(d): void {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }

  createdragended() {
    const that = this;
    return function (d): void {
        if (!d3.event.active) {
        that.simulation.alphaTarget(0);
      }
      d.fx = null;
      d.fy = null;
    };

  }
/*
  createResizeCanvase() {
    const that = this;
    const el = document.getElementById('graph');
    return function() {
      that.svg.width = el.offsetWidth;
      that.height = el.offsetHeight;
      that.svg.setMaxArea(that.width, that.height);
    };

  }
  */

}
