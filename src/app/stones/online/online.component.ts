import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MqttAdapterService} from '../../mqtt-adapter.service';
import {StoneInTable} from '../../model/stone-in-table';
import { Subscription} from 'rxjs';
import {AggregatedStone} from '../../model/aggregated/aggregated-stone';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import {StoneService} from '../../stone.service';

@Component({
  selector: 'app-online',
  templateUrl: './online.component.html',
  styleUrls: ['./online.component.css']
})
export class OnlineComponent implements OnInit, OnDestroy {

  datasource = new MatTableDataSource<StoneInTable>();
  displayedColumns = ['name', 'major_minor', 'age', 'lastSeen', 'comment'];
  pageSizeOptions = [5, 10, 0];
  private subscription: Subscription;
  private filter: string;


  constructor(private mqttAdapter: MqttAdapterService, private stoneService: StoneService) { }

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  ngOnInit() {
    this.subscription = this.mqttAdapter.aggregatedStonesSubject().subscribe( (map) => {
      const newList: StoneInTable[] = [];
      for (const mac in map) {
        if (mac) {
          const aStone: AggregatedStone = map[mac];
          const name = this.stoneService.nameStatic(mac);
          newList.push(new StoneInTable(
            aStone.comment, aStone.uuid, aStone.major, aStone.minor, new Date(aStone.timestamp), name));
        }
      }
      this.pageSizeOptions = [5, 10, newList.length];
      this.datasource = new MatTableDataSource(newList);
      this.datasource.paginator = this.paginator;
      this.datasource.sort = this.sort;
      this.datasource.filter = this.filter;
    });

  }

  applyFilter(filterValue: string) {
    this.filter = filterValue.trim().toLowerCase();
    this.datasource.filter = this.filter;
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }


}
