export interface AggregatedGraph {
  nodes: AggregatedGraphNode[];
  links: AggregatedGraphLink[];
}
export interface AggregatedGraphNode {
  id: string;
  timestamp?: Date;
}
export interface AggregatedGraphLink {
  source: string;
  target: string;
  rssi: number;
  timestamp: Date;
}
