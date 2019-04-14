import * as d3 from 'd3';
import {GraphNG} from './graph.model';
import { MatBottomSheet } from '@angular/material';
import { NodeInfoComponent } from './nodeinfo';

export class D3Widget {

  static forceSimulation: any;

  static forceSimulationNodes = [];
  static forceSimulationLinks = [];

  static transform: any;
  static canvas: any;
  static context: any;

  static width: number;
  static height: number;

  static background: HTMLImageElement;

  constructor(private bottomSheet: MatBottomSheet) { }

  run() {
    document.addEventListener('contextmenu', event => event.preventDefault());

    var w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('app-graph')[0],
    x = w.innerWidth || e.clientWidth || g.clientWidth,
    y = w.innerHeight|| e.clientHeight|| g.clientHeight;

    const width = x;
    const height = y;

    const img = new Image();
    img.onload = () => {
      D3Widget.background = img;
      this.simulationUpdate();
    };
    img.onerror = () => {
      setTimeout(() => {
        img.src = undefined;
        img.src = 'http://localhost:8080/deutschland-karte.jpg';
      }, 5000);
    };
    img.src = 'http://localhost:8080/deutschland-karte.jpg';

    const canvas = d3.select('#graphDiv').append('canvas')
      .attr('width', width + 'px')
      .attr('height', height + 'px')
      .node();

    const context = canvas.getContext('2d');

    d3.select('body').append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0);

    const simulation = d3.forceSimulation()
                  .force('center', d3.forceCenter(width / 2, height / 2))
                  .force('x', d3.forceX(width / 2).strength(0.1))
                  .force('y', d3.forceY(height / 2).strength(0.1))
                  .force('charge', d3.forceManyBody().strength(-50))
                  .force('link', d3.forceLink().strength(1).id(function(d) { return d.id; }))
                  .alphaTarget(0)
                  .alphaDecay(0.05);

    D3Widget.transform = d3.zoomIdentity;
    D3Widget.context = context;
    D3Widget.canvas = canvas;
    D3Widget.forceSimulation = simulation;
    D3Widget.width = width;
    D3Widget.height = height;

    this.initGraph();
  }

  updateGraphNg(g: GraphNG): void {
    D3Widget.forceSimulation.stop();
    D3Widget.forceSimulationLinks = g.links;
    D3Widget.forceSimulationNodes = g.nodes;
    D3Widget.forceSimulation.nodes(D3Widget.forceSimulationNodes);
    D3Widget.forceSimulation.force('link').links(D3Widget.forceSimulationLinks);
    D3Widget.forceSimulation.alpha(1).restart();
    D3Widget.forceSimulation.resume();
  }

  initGraph() {
    const zoomed = () => {
      D3Widget.transform = d3.event.transform;
      this.simulationUpdate();
    }

    const dragsubject = () => {
      var i,
      x = D3Widget.transform.invertX(d3.event.x),
      y = D3Widget.transform.invertY(d3.event.y),
      dx,
      dy;
      for (i = D3Widget.forceSimulationNodes.length - 1; i >= 0; --i) {
        const node = D3Widget.forceSimulationNodes[i];
        dx = x - node.x;
        dy = y - node.y;

        if (dx * dx + dy * dy < 5 * 5) {

          node.x =  D3Widget.transform.applyX(node.x);
          node.y = D3Widget.transform.applyY(node.y);

          return node;
        }
      }
    };

    const dragstarted = () => {
      if (!d3.event.active) { D3Widget.forceSimulation.alphaTarget(0.3).restart(); }
      d3.event.subject.fx = D3Widget.transform.invertX(d3.event.x);
      d3.event.subject.fy = D3Widget.transform.invertY(d3.event.y);
      d3.event.subject.click = true;
      const subject = d3.event.subject;
      setTimeout(() => {
        subject.click = false;
      }, 300);
    };

    const dragged = () => {
      d3.event.subject.fx = D3Widget.transform.invertX(d3.event.x);
      d3.event.subject.fy = D3Widget.transform.invertY(d3.event.y);
    };

    const dragended = () => {
      if (!d3.event.active) { D3Widget.forceSimulation.alphaTarget(0); }
      if (d3.event.subject.click) {
        if(!d3.event.subject.fixed) {
          d3.event.subject.fx = undefined;
          d3.event.subject.fy = undefined;
        }
        this.bottomSheet.open(NodeInfoComponent, {
          data: { width: D3Widget.width, node: d3.event.subject },
        });
      } else {
        d3.event.subject.fx = D3Widget.transform.invertX(d3.event.x);
        d3.event.subject.fy = D3Widget.transform.invertY(d3.event.y);
        d3.event.subject.fixed = true;
      }
    };

    d3.select(D3Widget.canvas)
        .call(d3.drag().subject(dragsubject).on('start', dragstarted).on('drag', dragged).on('end', dragended))
        .call(d3.zoom().scaleExtent([1 / 10, 8]).on('zoom', zoomed));


    D3Widget.forceSimulation.nodes(D3Widget.context)
              .on('tick', this.simulationUpdate);

    D3Widget.forceSimulation.force('link')
              .links(D3Widget.context);
  }

  private simulationUpdate() {
    D3Widget.context.save();
    D3Widget.context.clearRect(0, 0, D3Widget.width, D3Widget.height);
    D3Widget.context.translate(D3Widget.transform.x, D3Widget.transform.y);
    D3Widget.context.scale(D3Widget.transform.k, D3Widget.transform.k);

    if (D3Widget.background) {
      D3Widget.context.drawImage(D3Widget.background, 0, 0);
    }

    D3Widget.context.beginPath();
    D3Widget.forceSimulationLinks.forEach(function(d) {
      D3Widget.context.moveTo(d.source.x, d.source.y);
      D3Widget.context.lineTo(d.target.x, d.target.y);
    });
    D3Widget.context.strokeStyle = '#aaa';
    D3Widget.context.stroke();

      // Draw the nodes
      D3Widget.forceSimulationNodes.forEach(function(d, i) {

        D3Widget.context.beginPath();
        D3Widget.context.moveTo(d.x + 3, d.y);
        D3Widget.context.arc(d.x, d.y, 3, 0, 2 * Math.PI);
        D3Widget.context.fillText(d.name, d.x, d.y + 12);
        D3Widget.context.fill();
      });

      D3Widget.context.restore();
      // transform = d3.zoomIdentity;
  }
}
