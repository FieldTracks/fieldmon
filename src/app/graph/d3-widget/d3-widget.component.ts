import { WebdavService } from './../../webdav.service';
import { GraphConfigService, GraphConfig } from './../../graph-config.service';
import {AfterContentInit, Component, Input, OnDestroy, OnInit} from '@angular/core';
import * as d3 from 'd3';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import {NodeInfoComponent} from '../nodeinfo';
import {Subscription, Subject} from 'rxjs';
import {MqttAdapterService} from '../../mqtt-adapter.service';
import {StoneService} from '../../stone.service';
import {ConfigService} from '../../config.service';
import {FieldmonConfig} from '../../model/configuration/fieldmon-config';
import { AggregatedGraph } from 'src/app/model/aggregated/aggregated-graph';

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
  private graphConfigSubscription: Subscription;
  private positionChangeSubscription: Subscription;
  private fieldmonConfig: FieldmonConfig;
  private graphConfig: GraphConfig;

  links: D3Link[] = [];
  readonly nodes: D3Node[] = [];
  readonly background: HTMLImageElement = new Image();
  readonly manualPositionChange = new Subject<D3Node>();
  fixedNodes = new Map<string, D3Node>(); // Holds *references* to nodes in this.nodes having fixed position
  _backgroundUrl: string;

  private endTime: number;
  private simulationDuration = 3000;

  set backgroundUrl(url: string) {
    this._backgroundUrl = url;
    this.webdavService.getAsObjectUrl(url).subscribe( (image) => {
      this.background.src = image;
    });
  }

  get backgroundUrl() {
    return this._backgroundUrl;
  }


  constructor(private bottomSheet: MatBottomSheet,
              private mqttService: MqttAdapterService,
              private stoneService: StoneService,
              private configService: ConfigService,
              private graphConfigService: GraphConfigService,
              private webdavService: WebdavService) {
    this.background.onerror = () => {
      setTimeout(() => {
        const url = this.background.src;
        this.background.src = undefined;
        this.background.src = url; // The url need to be reset, so the image can bes refetch
      }, 5000);
    };
  }

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
    if (this.graphConfigSubscription) {
      this.graphConfigSubscription.unsubscribe();
    }
    if (this.positionChangeSubscription) {
      this.positionChangeSubscription.unsubscribe();
    }
  }

  ngAfterContentInit(): void {
    this.run();
    this.subscription = this.mqttService.aggregatedGraphSubject().subscribe( (ag) => {
      this.updateData(ag, this.stoneService.names.getValue());
      this.refresh();
    });

    this.positionChangeSubscription = this.manualPositionChange.subscribe(() => {
      this.fieldmonConfig.backgroundImage = this.backgroundUrl;
      this.fieldmonConfig.fixedNodes = Array.from(this.fixedNodes.values());
      this.configService.submitConfiguration(this.fieldmonConfig);
    });

    this.graphConfigSubscription = this.graphConfigService.currentConfig.subscribe( (grc) => {
      this.graphConfig = grc;
      // TODO: Parse config
    });

    this.configSubscription = this.configService.currentConfiguration().subscribe( (fmc) => {
      this.fieldmonConfig = fmc;
      if (this.backgroundUrl !== fmc.backgroundImage) {
        this.backgroundUrl = fmc.backgroundImage;
      }
      this.onRemoteNodeChange(fmc.fixedNodes);
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


    this.background.onload = () => {
      this.redrawCanvas();
    };

    const canvasElem = d3.select('#graphDiv').append('canvas')
      .attr('width', width + 'px')
      .attr('height', height + 'px');
    const canvas =  canvasElem.node();

    const click = () => {
      this.endTime = undefined;
      D3WidgetComponent.forceSimulation.alpha(1).restart();
    };

    canvas.addEventListener('pointerdown', click);
    canvas.addEventListener('touchstart', click);

    canvas.addEventListener('pointerup', () => this.startSimulation(this));
    canvas.addEventListener('touchend', () => this.startSimulation(this));

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

    this.startSimulation(this);
  }

  /**
   * Take changed node or link data in the model to account. Has to be called each time the data changes
   */
  refresh(): void {
    if (!this.endTime ||  Date.now() < this.endTime) {
      D3WidgetComponent.forceSimulation.stop();
      D3WidgetComponent.forceSimulation.nodes(this.nodes);
      D3WidgetComponent.forceSimulation.force('link').links(this.links);
      D3WidgetComponent.forceSimulation.alpha(1).restart();
      this.redrawCanvas();
    } else {
      D3WidgetComponent.forceSimulation.stop();
    }
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
        dy,
        index,
        minDist = 99999999;

      for (i = 0; i < this.nodes.length; i++) {
        const node = this.nodes[i];
        dx = eventX - node.x;
        dy = eventY - node.y;

        const dist = dx * dx + dy * dy;

        if (dist < 20 * 20 && dist < minDist) {
          minDist = dist;
          index = i;
        }
      }

      if (index !== undefined) {
        const node = this.nodes[index];
        node.x =  D3WidgetComponent.transform.applyX(node.x);
        node.y = D3WidgetComponent.transform.applyY(node.y);

        return node;
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
          data: { width: D3WidgetComponent.width, node: d3.event.subject, d3widget: this, mac: d3.event.subject.id },
        });
      } else {
        d3.event.subject.fx = D3WidgetComponent.transform.invertX(d3.event.x);
        d3.event.subject.fy = D3WidgetComponent.transform.invertY(d3.event.y);
        d3.event.subject.fixed = true;
        this.onLocalNodeChange(d3.event.subject);
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

    if (this.background) {
      D3WidgetComponent.context.drawImage(this.background, 0 - (this.background.width / 2),
        0 - (this.background.height / 2));
    }

    D3WidgetComponent.context.beginPath();
    this.links.forEach(function(d) {
      D3WidgetComponent.context.moveTo(d.source.x, d.source.y);
      D3WidgetComponent.context.lineTo(d.target.x, d.target.y);
    });
    D3WidgetComponent.context.strokeStyle = '#aaa';
    D3WidgetComponent.context.stroke();
    // Draw the nodes
    this.nodes.forEach(function(d, i) {
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

  onLocalNodeChange(node: D3Node) {
    if (node.fixed) {
      this.fixedNodes.set(node.id, {group: node.group, name: node.name, id: node.id, fx: node.fx, fy: node.fy, fixed: true});
    } else {
      this.fixedNodes.delete(node.id);
    }
    this.manualPositionChange.next(node);
  }

  onRemoteNodeChange(nodes: D3Node[]) {
    const map = new Map<string, D3Node>();

    if (nodes) {
      nodes.forEach((value) => {
        if (value) {
          map.set(value.id, value);

          let localNode = this.fixedNodes.get(value.id);
          console.log('Local node is a fixed node', value.id);

          if (!localNode) {
            localNode = this.findNodeByMac(value.id);
            this.fixedNodes.set(value.id, localNode);
          }

          if (localNode) {
            localNode.fixed = true;
            localNode.fx = value.fx;
            localNode.fy = value.fy;
          }
        }
      });
      this.startSimulation(this);
    }

    this.fixedNodes = map;

    this.nodes.forEach(node => {
      const fixedNode = this.fixedNodes.get(node.id);

      if (node.fixed && !fixedNode) {
        node.fixed = false;
        node.fx = undefined;
        node.fy = undefined;
      } else if (fixedNode) {
        node.fx = fixedNode.fx;
        node.fy = fixedNode.fy;
        node.x = fixedNode.fx;
        node.y = fixedNode.fy;
      }
    });

  }

  updateData(aggregatedGraph: AggregatedGraph, names: Map<string, string>) {
    const now = new Date().getTime();
    aggregatedGraph.nodes.forEach( (node) => {
      if (!this.findNodeByMac(node.id) ) {
        const newNode: D3Node = {name: names.get(node.id) || node.id, id: node.id, group: 1};

        if (this.fieldmonConfig.fixedNodes) {
          const fixedNode = this.fieldmonConfig.fixedNodes.find(n => n.id === node.id);

          if (fixedNode) {
            newNode.fixed = true;
            newNode.fx = fixedNode.fx;
            newNode.fy = fixedNode.fy;
          }

        }

        this.nodes.push(newNode);
      }
    });
    this.links = [];
    aggregatedGraph.links.forEach( (link) => {
    const isInPast = (now - link.timestamp.getTime() > 30000);
    if (!isInPast) {
        this.links.push({source: this.findNodeByMac(link.source),
          target: this.findNodeByMac(link.target),
          value: link.rssi,
        });
      }
    });
    this.startSimulation(this);
  }

  private findNodeByMac(mac: string): D3Node {
    return this.nodes.find((n) => n.id === mac);
  }

  private startSimulation(context) {
    context.endTime = Date.now() + context.simulationDuration;
  }
}

export interface D3Link {
  source: D3Node;
  target: D3Node;
  value: number;
}

export interface D3Node {
  name: string;
  id: string;
  group: 1;
  x?: number;
  y?: number;
  fx?: number;
  fy?: number;
  fixed?: boolean;
}
