/*
This file is part of fieldmon - (C) The Fieldtracks Project

    fieldmon is distributed under the civilian open source license (COSLi).
    Military usage is forbidden.

    You should have received a copy of COLi along with fieldmon.
    If not, please contact info@fieldtracks.org

 */
import {Component, OnDestroy, OnInit} from '@angular/core';
import {EventEmitter} from '@angular/core';
import {Output} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {HeaderBarConfiguration, HeaderBarService} from '../../header-bar.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  private config: HeaderBarConfiguration;

  private subscription: Subscription;

  constructor(private titleService: HeaderBarService) { }

  @Output()
  sidebarTooggle = new EventEmitter();

  ngOnInit(): void {
      this.subscription = this.titleService.currentConfiguration.subscribe( (conf) => {
          this.config = conf;
        }
      );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onToggle() {
    this.sidebarTooggle.emit();
  }

  onRefresh() {
    this.titleService.refresh.next();
  }
  onSearch() {
    this.titleService.search.next();
  }
}
