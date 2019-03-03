import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MqttAdapterService} from '../../mqtt-adapter.service';
import {StoneInTable} from '../../model/stone-in-table';
import { Subscription} from 'rxjs';
import {AggregatedStone} from '../../model/aggregated/aggregated-stone';
import {MatPaginator, MatSort, MatTableDataSource} from '@angular/material';

@Component({
  selector: 'app-online',
  templateUrl: './online.component.html',
  styleUrls: ['./online.component.css']
})
export class OnlineComponent implements OnInit, OnDestroy {

  datasource = new MatTableDataSource<StoneInTable>();
  displayedColumns = ['major', 'minor', 'age', 'lastSeen', 'comment'];
  pageSizeOptions = [5, 10, 0];
  private subscription: Subscription;
  private filter: string;


  constructor(private mqttAdapter: MqttAdapterService) { }

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  ngOnInit() {
    this.subscription = this.mqttAdapter.aggregatedStonesSubject().subscribe( (map) => {
      const newList: StoneInTable[] = [];
      for (const mac in map) {
        if (mac) {
          const aStone: AggregatedStone = map[mac];
          newList.push(new StoneInTable(
            aStone.comment, aStone.uuid, aStone.major, aStone.minor, new Date(aStone.last_seen * 1000)));
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
