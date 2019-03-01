import {EventEmitter, Injectable, Output} from '@angular/core';
import {BehaviorSubject, Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HeaderBarService {

  currentConfiguration = new BehaviorSubject<HeaderBarConfiguration>({sectionTitle: ''});

  refreshingEnabled = new BehaviorSubject<boolean>(false);

  rotateRefreshButton = new Subject();

  constructor() {
  }
}
export interface HeaderBarConfiguration {
  sectionTitle: string;
  showSearch?: boolean;
  showRefresh?: boolean;
}
