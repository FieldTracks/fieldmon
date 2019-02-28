import { Component, OnDestroy, OnInit } from '@angular/core';
import { StoneOverviewDs } from '../../stone-overview/stone-overview-ds';
import { NamesDs } from 'src/app/names/names-ds';
import { SensorContactsDs } from 'src/app/sensor-contacts/sensor-contacts-ds';

@Component({
  selector: 'app-online',
  templateUrl: './online.component.html',
  styleUrls: ['./online.component.css']
})
export class OnlineComponent implements OnInit, OnDestroy {

  displayedColumns = ['major', 'minor', 'comment', 'age', 'lastSeen'];

  // a and b are only injected so they are initialized on login
  constructor(private datasource: StoneOverviewDs, private a: NamesDs, private b: SensorContactsDs) {
    datasource.emit();
    a.connect(null);
    b.connect(null);
  }


  ngOnInit() {
    console.log('Init');
  }

  ngOnDestroy() {
    console.log('Destroy');
  }

}
