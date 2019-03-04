import {AggregatedGraph} from '../model/aggregated/aggregated-graph';

export class GraphNG {
  links: D3Link[] = [];
  nodes: D3Node[] = [];

  updateData(aggregatedGraph: AggregatedGraph) {
    aggregatedGraph.nodes.forEach( (node) => {
      if (!this.findNodeByMac(node.id) ) {
        this.nodes.push({name: node.id, id: node.id, group: 1});
      }
    });
    aggregatedGraph.links.forEach( (link) => {
      console.log('Condition', link.source, link.target);
      const graphLink = this.links.find((d3l) => (d3l.source.id === link.source && d3l.target.id === link.target));
      if (graphLink) {
        graphLink.value = link.rssi + 200; // dbM to positive range
      } else {
        this.links.push({source: this.findNodeByMac(link.source), target: this.findNodeByMac(link.target), value: link.rssi + 200});
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
