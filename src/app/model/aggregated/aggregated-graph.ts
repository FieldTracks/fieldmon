export interface AggregatedGraph {
  nodes: AggregatedGraphNode[];
  links: AggregatedGraphLink[];
}
export interface AggregatedGraphNode {
  id: string;
}
export interface AggregatedGraphLink {
  source: string;
  target: string;
  rssi: number;
  timestamp: Date;
}
