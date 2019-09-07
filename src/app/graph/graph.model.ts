import { D3Node } from './graph.model';
import { Subject } from 'rxjs';
import {AggregatedGraph} from '../model/aggregated/aggregated-graph';
import {WebdavService} from '../webdav.service';

export class GraphNG {

  links: D3Link[] = [];
  readonly nodes: D3Node[] = [];
  readonly background: HTMLImageElement = new Image();
  readonly manualPositionChange = new Subject<D3Node>();
  readonly fixedNodes = new Map<string, D3Node>(); // Holds *references* to nodes in this.nodes having fixed position
  _backgroundUrl: string;

  set backgroundUrl(url: string) {
    this._backgroundUrl = url;
    this.webdavService.getAsObjectUrl(url).subscribe( (image) => {
      this.background.src = image;
    });
  }

  get backgroundUrl() {
    return this._backgroundUrl;
  }

  constructor(private webdavService: WebdavService) {
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
    const map = new Map<string, D3Node>();

    if (nodes) {

      nodes.forEach((value) => {
        if (value) {
          map.set(value.id, value);

          let localNode = this.fixedNodes.get(value.id);

          if (!localNode) {
            localNode = this.findNodeByMac(value.id);
            this.fixedNodes.set(value.id, localNode);
          }

          if (localNode) {
            localNode.fixed = true;
            localNode.fx = value.fx;
            localNode.fy = value.fy;
          } else {
            // tslint:disable-next-line:max-line-length
            console.log('FIXME: Bug triggered. Unable to set position for node "' + value.id + '" there is no d3 node for doing so. #known nodes ', this.nodes.length);
          }

        }
      });
    }

    this.fixedNodes.forEach((value, key) => {

      if (!map.has(key)) {
        this.fixedNodes.delete(key);

        value.fixed = false;
        value.fx = undefined;
        value.fy = undefined;
      }
    });


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
