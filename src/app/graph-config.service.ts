import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GraphConfigService {

  readonly currentConfig = new BehaviorSubject<GraphConfig>({});

  constructor() { }


}

export interface GraphConfig {
  showLastContacts?: boolean;
  showUnnamned?: boolean;
}
