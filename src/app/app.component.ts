import { Subscription } from 'rxjs';
import {Component, OnInit, OnDestroy, ViewChild, ElementRef} from '@angular/core';
import { HeaderBarService } from './header-bar.service';
import {FmComponent} from './helpers/fm-component';
import {MatMenu} from '@angular/material';

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

  @ViewChild('searchInput') searchField: ElementRef;

  private menu: MatMenu;

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
    if (component.fmHeader) {
      config = component.fmHeader();
    }
    this.headerBarService.updateConfiguration(config);
    let items = [];
    if (component.fmMenuItems) {
      items = component.fmMenuItems();
    }
    this.menu = null;
    if (component.fmtMenu) {
      this.menu = component.fmtMenu();
    }
    this.headerBarService.setMatMenu(this.menu);

    this.headerBarService.setMenu(items);
    this.showToggle = false;
  }

  toggleSearch() {
    this.showToggle = !this.showToggle;
    if (this.showToggle) {
      setTimeout( () => // Hack (c.f. https://stackoverflow.com/questions/50006888/angular-5-set-focus-on-input-element)
        this.searchField.nativeElement.focus()
      , 0);
    }
  }
}
