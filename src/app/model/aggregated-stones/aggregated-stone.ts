export interface AggregatedStone {
  uuid?: string;
  comment?: string;
  contacts?: AggregatedStoneSensorContact[];
  last_seen: number;
  minor?: number;
  major?: number;
}
export interface AggregatedStoneSensorContact {
  rssi_tx?: number;
  uuid?: string;
  mac: string;
  rssi_avg: number;
  major?: number;
  minor?: number;
}
