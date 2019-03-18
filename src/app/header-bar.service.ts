import {EventEmitter, Injectable, Output} from '@angular/core';
import {BehaviorSubject, Subject} from 'rxjs';
import {HeaderBarConfiguration} from './helpers/header-aware';

@Injectable({
  providedIn: 'root'
})
export class HeaderBarService {

  currentConfiguration = new BehaviorSubject<HeaderBarConfiguration>({sectionTitle: ''});

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
}

