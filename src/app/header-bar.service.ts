import {EventEmitter, Injectable, Output} from '@angular/core';
import {BehaviorSubject, Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HeaderBarService {

  currentConfiguration: BehaviorSubject<HeaderBarConfiguration>;

  refresh: Subject<void>;

  search: Subject<void>;


  constructor() {
    this.currentConfiguration = new BehaviorSubject(null);
    this.refresh = new Subject();
    this.search = new Subject();
  }
}
export interface HeaderBarConfiguration {
  sectionTitle: string;
  showSearch?: boolean;
  showRefresh?: boolean;
}
