import { D3Node } from './graph.model';
import { Subject } from 'rxjs';
import {AggregatedGraph} from '../model/aggregated/aggregated-graph';

export class GraphNG {
  links: D3Link[] = [];
  readonly nodes: D3Node[] = [];
  readonly background: HTMLImageElement = new Image();
  readonly manualPositionChange = new Subject<D3Node>();
  readonly fixedNodes = new Map<String, D3Node>();

  constructor() {
    this.background.onerror = () => {
      setTimeout(() => {
        const url = this.background.src;
        this.background.src = undefined;
        this.background.src = url; // The url need to be reset, so the image can bes refetch
      }, 5000);
    };
  }

  onLocalNodeChange(node: D3Node) {
    if (node.fixed) {
      this.fixedNodes.set(node.id, node);
    } else {
      this.fixedNodes.delete(node.id);
    }
    this.manualPositionChange.next(node);
  }

  onRemoteNodeChange(nodes: D3Node[]) {
    const map = new Map();

    nodes.forEach((n) => map.set(n.id, n));

    this.fixedNodes.forEach((value, key) => {
      const localNode = this.findNodeByMac(value.id);

      if (!map.has(key)) {
        this.fixedNodes.delete(key);

        localNode.fixed = false;
        localNode.fx = undefined;
        localNode.fy = undefined;
      }
    });

    map.forEach((value, key) => {
      const localNode = this.findNodeByMac(value.id);

      if(!this.fixedNodes.has(key)) {
        this.fixedNodes.set(key, localNode);
      }

      localNode.fixed = true;
      localNode.fx = value.fx;
      localNode.fy = value.fy;
    })
  }

  updateData(aggregatedGraph: AggregatedGraph, names: Map<string, string>) {
    const now = new Date().getTime();
    aggregatedGraph.nodes.forEach( (node) => {
      if (!this.findNodeByMac(node.id) ) {
        this.nodes.push({name: names.get(node.id) || node.id, id: node.id, group: 1});
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
  }

  private findNodeByMac(mac: string): D3Node {
    return this.nodes.find((n) => n.id === mac);
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
