import {EventEmitter, Injectable, Output} from '@angular/core';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {HeaderBarConfiguration, MenuItem} from './helpers/fm-component';

@Injectable({
  providedIn: 'root'
})
export class HeaderBarService {

  currentConfiguration = new BehaviorSubject<HeaderBarConfiguration>({sectionTitle: ''});

  private menuItems = new BehaviorSubject<MenuItem[]>([]);

  refreshingEnabled = new BehaviorSubject<boolean>(false);

  rotateRefreshButton = new Subject();

  searchEntered = new EventEmitter();

  constructor() {
  }

  updateConfiguration(config: HeaderBarConfiguration) {
    this.currentConfiguration.next(config);
  }

  refreshEnabled(active: boolean) {
    this.refreshingEnabled.next(active);
  }

  setMenu(items: MenuItem[]) {
    this.menuItems.next(items);
  }

  menu(): Observable<MenuItem[]> {
    return this.menuItems;
  }

}

