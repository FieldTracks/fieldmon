import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import {StoneService} from '../stone.service';
import {MqttAdapterService} from '../mqtt-adapter.service';
import {BehaviorSubject, Observable, Subscription} from 'rxjs';
import {StoneStatus} from '../model/stone-status';
import {AggregatedName} from '../model/aggregated/aggregated-name';
import {AggregatedStone} from '../model/aggregated/aggregated-stone';
import {map, startWith} from 'rxjs/operators';
import {AggregatedDevice} from '../model/aggregated/aggregated-devices';
import {environment} from '../../environments/environment';
import { MatCheckboxChange } from '@angular/material/checkbox';
import {AggregatedGraph, AggregatedGraphLink} from '../model/aggregated/aggregated-graph';
import {ageC} from '../helpers/age-helper';
// [style.width.px]="this.data.width * 0.8"



@Component({
  templateUrl: 'nodeinfo.html',
})
export class NodeInfoComponent implements OnInit, OnDestroy {


  device: Observable<AggregatedDevice>;
  aggregatedStone: Observable<AggregatedStone>;
  aggregatedLinks = new BehaviorSubject<NodeInfoLink[]>([]);
  mac: string;
  grafana_base: string;
  fixed: boolean;
  private subscription: Subscription;

  // aggregatedStoneStatus: Observable<AggregatedStone>;

  constructor(private bottomSheetRef: MatBottomSheetRef<NodeInfoComponent>, @Inject(MAT_BOTTOM_SHEET_DATA) public data: any,
              private stoneService: StoneService,
              private mqttService: MqttAdapterService) {
    this.mac = data.mac;
    this.device = this.stoneService.knownDevices.pipe(
      map( (sMap: Map<String, AggregatedDevice>) => sMap.get(data.mac))
    );
    this.aggregatedStone = this.mqttService.aggregatedStonesSubject().pipe(
      map( (stoneMap) => stoneMap[this.mac])
    );
    this.grafana_base = environment.grafana_base;
    this.fixed = this.data.node.fixed;
  }



  change($event: MatCheckboxChange) {
    if ($event.checked) {
      this.fixed = true;
      this.data.node.fx = this.data.node.x;
      this.data.node.fy = this.data.node.y;
      this.data.node.fixed = true;
    } else {
      this.fixed = false;
      this.data.node.fx = undefined;
      this.data.node.fy = undefined;
      this.data.node.fixed = false;
    }
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  ngOnInit(): void {
    this.subscription = this.mqttService.aggregatedGraphSubject().subscribe( (ag: AggregatedGraph) => this.processGraph(ag));
  }

  private processGraph(ag: AggregatedGraph): void {
    console.log('process graph');
    const agLinks: NodeInfoLink[] = [];
    for (const alink of ag.links) {
      if (alink.source === this.mac || alink.target === this.mac) {
        const rMac = (alink.source === this.mac) ? alink.target : alink.source;
        agLinks.push({...alink,
          rDev: this.stoneService.infoStatic(rMac),
          name: this.stoneService.nameStatic(rMac),
          rMac: rMac,
          age: function() {
            return ageC('' + alink.timestamp);

          }
        });
      }
    }
    this.aggregatedLinks.next(agLinks.sort( (a, b) => (a.timestamp >= b.timestamp) ? -1 : 1));
  }


}
interface NodeInfoLink extends AggregatedGraphLink {
  rDev?: AggregatedDevice;
  name?: string;
  rMac?: string;
  age?: any;
}
