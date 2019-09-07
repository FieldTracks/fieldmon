import {AfterContentInit, Component, Input, OnDestroy, OnInit} from '@angular/core';
import * as d3 from 'd3';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import {D3Node, GraphNG} from '../graph.model';
import {NodeInfoComponent} from '../nodeinfo';
import {Subscription} from 'rxjs';
import {MqttAdapterService} from '../../mqtt-adapter.service';
import {StoneService} from '../../stone.service';
import {ConfigService} from '../../config.service';
import {FieldmonConfig} from '../../model/configuration/fieldmon-config';

@Component({
  selector: 'app-d3-widget',
  templateUrl: './d3-widget.component.html',
  styleUrls: ['./d3-widget.component.css']
})
export class D3WidgetComponent implements OnInit, AfterContentInit, OnDestroy {
  static forceSimulation: any;

  static transform: any;
  static canvas: any;
  static context: any;

  static width: number;
  static height: number;


  private subscription: Subscription;
  private configSubscription: Subscription;
  private fieldmonConfig: FieldmonConfig;


  constructor(private bottomSheet: MatBottomSheet,
              private mqttService: MqttAdapterService,
              private stoneService: StoneService,
              private configService: ConfigService) {
  }



  @Input()
  graph: GraphNG;

  static getNodeColor(node: D3Node) {
    if (node.fixed) {
      return '#F00';
    } else {
      return '#00F';
    }
  }

  ngOnInit(): void {
    // throw new Error("Method not implemented.");
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.configSubscription) {
      this.configSubscription.unsubscribe();
    }
  }

  ngAfterContentInit(): void {
    this.run();
    this.subscription = this.mqttService.aggregatedGraphSubject().subscribe( (ag) => {
      this.graph.updateData(ag, this.stoneService.names.getValue());
      this.refresh();
    });
    this.configSubscription = this.configService.currentConfiguration().subscribe( (fmc) => {
      this.fieldmonConfig = fmc;
      if (this.graph.backgroundUrl !== fmc.backgroundImage) {
        this.graph.backgroundUrl = fmc.backgroundImage;
      }
      this.graph.onRemoteNodeChange(fmc.fixedNodes);
      this.refresh();
    });

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


    this.graph.background.onload = () => {
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
      D3WidgetComponent.width = window.innerWidth;
      D3WidgetComponent.height = window.innerHeight - 75;
      this.refresh();
    });

    const context = canvas.getContext('2d');

    d3.select('body').append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0);

    const simulation = d3.forceSimulation()
      .force('charge', d3.forceManyBody().strength(-0.125))
      .force('link', d3.forceLink().distance(() => 50)
        .strength((link) => {
          // @ts-ignore
          const linkStrenght = Math.min(Math.pow(10, (link.value / 20) + 3 ), 1);
          return linkStrenght; }).id(function(node) { return node.id; }))
      .alphaTarget(0)
      .alphaDecay(0.05);

    D3WidgetComponent.transform = d3.zoomIdentity;
    D3WidgetComponent.transform.x = width / 2;
    D3WidgetComponent.transform.y = height / 2;

    D3WidgetComponent.context = context;
    D3WidgetComponent.canvas = canvas;
    D3WidgetComponent.forceSimulation = simulation;
    D3WidgetComponent.width = width;
    D3WidgetComponent.height = height;

    this.initGraph();
  }

  /**
   * Take changed node or link data in the model to account. Has to be called each time the data changes
   */
  refresh(): void {
    D3WidgetComponent.forceSimulation.stop();
    D3WidgetComponent.forceSimulation.nodes(this.graph.nodes);
    D3WidgetComponent.forceSimulation.force('link').links(this.graph.links);
    D3WidgetComponent.forceSimulation.alpha(1).restart();
    this.redrawCanvas();
  }

  /**
   * Register callback functions
   */
  private initGraph() {
    const zoomed = () => {
      D3WidgetComponent.transform = d3.event.transform;
      this.redrawCanvas();
    };

    const dragsubject = () => {
      const eventX = D3WidgetComponent.transform.invertX(d3.event.x);
      const eventY = D3WidgetComponent.transform.invertY(d3.event.y);

      let i,
        dx,
        dy;
      for (i = this.graph.nodes.length - 1; i >= 0; --i) {
        const node = this.graph.nodes[i];
        dx = eventX - node.x;
        dy = eventY - node.y;

        if (dx * dx + dy * dy < 5 * 5) {

          node.x =  D3WidgetComponent.transform.applyX(node.x);
          node.y = D3WidgetComponent.transform.applyY(node.y);

          return node;
        }
      }
    };

    const dragstarted = () => {
      if (!d3.event.active) { D3WidgetComponent.forceSimulation.alphaTarget(0.3).restart(); }
      d3.event.subject.fx = D3WidgetComponent.transform.invertX(d3.event.x);
      d3.event.subject.fy = D3WidgetComponent.transform.invertY(d3.event.y);
      d3.event.subject.click = true;
      const subject = d3.event.subject;
      setTimeout(() => {
        subject.click = false;
      }, 300);
    };

    const dragged = () => {
      d3.event.subject.fx = D3WidgetComponent.transform.invertX(d3.event.x);
      d3.event.subject.fy = D3WidgetComponent.transform.invertY(d3.event.y);
    };

    const dragended = () => {
      if (!d3.event.active) { D3WidgetComponent.forceSimulation.alphaTarget(0); }
      if (d3.event.subject.click) {
        if (!d3.event.subject.fixed) {
          // This will prevent the node to be pinned when shortly clicked
          d3.event.subject.fx = undefined;
          d3.event.subject.fy = undefined;
        }
        this.bottomSheet.open(NodeInfoComponent, {
          data: { width: D3WidgetComponent.width, node: d3.event.subject, graph: this.graph },
        });
      } else {
        d3.event.subject.fx = D3WidgetComponent.transform.invertX(d3.event.x);
        d3.event.subject.fy = D3WidgetComponent.transform.invertY(d3.event.y);
        d3.event.subject.fixed = true;
        this.graph.onLocalNodeChange(d3.event.subject);
      }
    };

    d3.select(D3WidgetComponent.canvas)
      .call(d3.drag().subject(dragsubject).on('start', dragstarted).on('drag', dragged).on('end', dragended))
      .call(d3.zoom().scaleExtent([1 / 10, 8]).on('zoom', zoomed));


    D3WidgetComponent.forceSimulation.nodes(D3WidgetComponent.context)
      .on('tick', () => this.refresh() );

    D3WidgetComponent.forceSimulation.force('link')
      .links(D3WidgetComponent.context);
  }

  private redrawCanvas() {
    D3WidgetComponent.context.save();
    D3WidgetComponent.context.fillStyle = '#000';
    D3WidgetComponent.context.clearRect(0, 0, D3WidgetComponent.width, D3WidgetComponent.height);
    D3WidgetComponent.context.translate(D3WidgetComponent.transform.x, D3WidgetComponent.transform.y);
    D3WidgetComponent.context.scale(D3WidgetComponent.transform.k, D3WidgetComponent.transform.k);

    if (this.graph.background) {
      D3WidgetComponent.context.drawImage(this.graph.background, 0 - (this.graph.background.width / 2),
        0 - (this.graph.background.height / 2));
    }

    D3WidgetComponent.context.beginPath();
    this.graph.links.forEach(function(d) {
      D3WidgetComponent.context.moveTo(d.source.x, d.source.y);
      D3WidgetComponent.context.lineTo(d.target.x, d.target.y);
    });
    D3WidgetComponent.context.strokeStyle = '#aaa';
    D3WidgetComponent.context.stroke();
    // Draw the nodes
    this.graph.nodes.forEach(function(d, i) {
      D3WidgetComponent.context.fillStyle = D3WidgetComponent.getNodeColor(d);
      D3WidgetComponent.context.beginPath();
      D3WidgetComponent.context.moveTo(d.x + 3, d.y);
      D3WidgetComponent.context.arc(d.x, d.y, 5, 0, 2 * Math.PI);
      D3WidgetComponent.context.fill();
      D3WidgetComponent.context.beginPath();
      D3WidgetComponent.context.fillStyle = '#000';
      D3WidgetComponent.context.fillText(d.name, d.x, d.y + 12);
      D3WidgetComponent.context.fill();
    });

    D3WidgetComponent.context.restore();
  }
}
