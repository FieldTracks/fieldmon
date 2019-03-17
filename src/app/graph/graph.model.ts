import {AggregatedGraph} from '../model/aggregated/aggregated-graph';

export class GraphNG {
  links: D3Link[] = [];
  nodes: D3Node[] = [];

  updateData(aggregatedGraph: AggregatedGraph, names: string[]) {
    const now = new Date().getTime();
    aggregatedGraph.nodes.forEach( (node) => {
      if (!this.findNodeByMac(node.id) ) {
        this.nodes.push({name: names[node.id] || node.id, id: node.id, group: 1});
      }
    });
    this.links = [];
    aggregatedGraph.links.forEach( (link) => {
     const isInPast = (now - link.timestamp.getTime() > 30000);
     if (!isInPast) {
        this.links.push({source: this.findNodeByMac(link.source),
          target: this.findNodeByMac(link.target),
          value: link.rssi + 200,
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
}
