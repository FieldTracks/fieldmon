import * as d3 from 'd3';
import {D3Node, GraphNG} from './graph.model';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { NodeInfoComponent } from './nodeinfo';

export class D3Widget {

  constructor(private bottomSheet: MatBottomSheet, graph: GraphNG) {
    D3Widget.graph = graph;
  }

  static forceSimulation: any;

  static transform: any;
  static canvas: any;
  static context: any;

  static width: number;
  static height: number;

  static graph: GraphNG;

  static getNodeColor(node: D3Node) {
    if (node.fixed) {
      return '#F00';
    } else {
      return '#00F';
    }
  }

  /**
   * Used to start the simulation. Has to be called once in the beginning
   */
  run() {
    document.addEventListener('contextmenu', event => event.preventDefault());

    const w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('app-graph')[0],
    x = w.innerWidth,
    y = window.innerHeight - 75;

    const graphAppSize = document.getElementsByTagName('app-graph')[0].clientHeight;
    const width = x;
    const height = y;


    D3Widget.graph.background.onload = () => {
      this.redrawCanvas();
    };

    const canvasElem = d3.select('#graphDiv').append('canvas')
      .attr('width', width + 'px')
      .attr('height', height + 'px');
    const canvas =  canvasElem.node();

    window.addEventListener('resize', () => {
      console.log('Resizing to:', window.innerWidth, window.innerHeight - 75 );
      canvasElem
        .attr('width', window.innerWidth + 'px')
        .attr('height', window.innerHeight - 75 + 'px');
      this.redrawCanvas();
    });

    const context = canvas.getContext('2d');

    d3.select('body').append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0);

    const simulation = d3.forceSimulation()
                  .force('charge', d3.forceManyBody().strength(-0.125))
                  .force('link', d3.forceLink().distance(() => 50)
                    .strength((link) => { const linkStrenght = Math.min(Math.pow(10, (link.value / 20) + 3 ), 1);
                    return linkStrenght; }).id(function(d) { return d.id; }))
                  .alphaTarget(0)
                  .alphaDecay(0.05);

    D3Widget.transform = d3.zoomIdentity;
    D3Widget.transform.x = width / 2;
    D3Widget.transform.y = height / 2;

    D3Widget.context = context;
    D3Widget.canvas = canvas;
    D3Widget.forceSimulation = simulation;
    D3Widget.width = width;
    D3Widget.height = height;

    this.initGraph();
  }

  /**
   * Take changed node or link data in the model to account. Has to be called each time the data changes
   */
  refresh(): void {
    D3Widget.forceSimulation.stop();
    D3Widget.forceSimulation.nodes(D3Widget.graph.nodes);
    D3Widget.forceSimulation.force('link').links(D3Widget.graph.links);
    D3Widget.forceSimulation.alpha(1).restart();
    this.redrawCanvas();
  }

  /**
   * Register callback functions
   */
  private initGraph() {
    const zoomed = () => {
      D3Widget.transform = d3.event.transform;
      this.redrawCanvas();
    };

    const dragsubject = () => {
      let i,
      x = D3Widget.transform.invertX(d3.event.x),
      y = D3Widget.transform.invertY(d3.event.y),
      dx,
      dy;
      for (i = D3Widget.graph.nodes.length - 1; i >= 0; --i) {
        const node = D3Widget.graph.nodes[i];
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
        if (!d3.event.subject.fixed) {
          // This will prevent the node to be pinned when shortly clicked
          d3.event.subject.fx = undefined;
          d3.event.subject.fy = undefined;
        }
        this.bottomSheet.open(NodeInfoComponent, {
          data: { width: D3Widget.width, node: d3.event.subject, graph: D3Widget.graph },
        });
      } else {
        d3.event.subject.fx = D3Widget.transform.invertX(d3.event.x);
        d3.event.subject.fy = D3Widget.transform.invertY(d3.event.y);
        d3.event.subject.fixed = true;
        D3Widget.graph.onLocalNodeChange(d3.event.subject);
      }
    };

    d3.select(D3Widget.canvas)
        .call(d3.drag().subject(dragsubject).on('start', dragstarted).on('drag', dragged).on('end', dragended))
        .call(d3.zoom().scaleExtent([1 / 10, 8]).on('zoom', zoomed));


    D3Widget.forceSimulation.nodes(D3Widget.context)
              .on('tick', () => this.refresh() );

    D3Widget.forceSimulation.force('link')
              .links(D3Widget.context);
  }

  private redrawCanvas() {
    D3Widget.context.save();
    D3Widget.context.fillStyle = '#000';
    D3Widget.context.clearRect(0, 0, D3Widget.width, D3Widget.height);
    D3Widget.context.translate(D3Widget.transform.x, D3Widget.transform.y);
    D3Widget.context.scale(D3Widget.transform.k, D3Widget.transform.k);

    if (D3Widget.graph.background) {
      D3Widget.context.drawImage(D3Widget.graph.background, 0 - (D3Widget.graph.background.width / 2),
        0 - (D3Widget.graph.background.height / 2));
    }

    D3Widget.context.beginPath();
    D3Widget.graph.links.forEach(function(d) {
      D3Widget.context.moveTo(d.source.x, d.source.y);
      D3Widget.context.lineTo(d.target.x, d.target.y);
    });
    D3Widget.context.strokeStyle = '#aaa';
    D3Widget.context.stroke();
      // Draw the nodes
      D3Widget.graph.nodes.forEach(function(d, i) {
        D3Widget.context.fillStyle = D3Widget.getNodeColor(d);
        D3Widget.context.beginPath();
        D3Widget.context.moveTo(d.x + 3, d.y);
        D3Widget.context.arc(d.x, d.y, 5, 0, 2 * Math.PI);
        D3Widget.context.fill();
        D3Widget.context.beginPath();
        D3Widget.context.fillStyle = '#000';
        D3Widget.context.fillText(d.name, d.x, d.y + 12);
        D3Widget.context.fill();
      });

      D3Widget.context.restore();
  }



}
