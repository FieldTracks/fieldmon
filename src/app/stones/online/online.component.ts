import {Component, OnDestroy, OnInit} from '@angular/core';
import {MqttAdapterService} from '../../mqtt-adapter.service';
import {StoneOverviewDs} from '../../stone-overview/stone-overview-ds';
import {DataSource} from '@angular/cdk/typings/esm5/collections';
import {StoneInTable} from '../../model/stone-in-table';

@Component({
  selector: 'app-online',
  templateUrl: './online.component.html',
  styleUrls: ['./online.component.css']
})
export class OnlineComponent implements OnInit, OnDestroy {

  datasource: DataSource<StoneInTable>;

  displayedColumns = ['major', 'minor', 'comment', 'age', 'lastSeen'];

  constructor(private mqttAdapter: MqttAdapterService) {
    this.datasource = new StoneOverviewDs(mqttAdapter);
  }


  ngOnInit() {
    console.log("Init");
  }

  ngOnDestroy() {
    this.datasource.disconnect(null);
    console.log("Destroy");
  }

}
