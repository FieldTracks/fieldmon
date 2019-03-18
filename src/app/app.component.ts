import { Subscription } from 'rxjs';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { HeaderBarService } from './header-bar.service';
import {HeaderAware} from './helpers/header-aware';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'app';

  showToggle: boolean;
  openSidenav = false;
  private subscription: Subscription;
  searchString: string;

  constructor(private headerBarService: HeaderBarService) { }

  public updateSearch(): void {
    setTimeout(() => {  // Timeout for better UX
      this.headerBarService.searchEntered.emit(this.searchString);
    });
  }

  ngOnInit() {
    this.subscription = this.headerBarService.searchEntered.subscribe((searchString) => {
      this.searchString = searchString;
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  routerOutletActivated(component: any) {
    let config = {sectionTitle: ''}
    if (component.fieldmonHeader) {
      config = component.fieldmonHeader();
    }
    this.headerBarService.updateConfiguration(config);
  }
}
