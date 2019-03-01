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
import {BehaviorSubject, Subscription} from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  private config: HeaderBarConfiguration = {sectionTitle: ''};

  private subscription: Subscription;
  private refreshActive: boolean;
  private refreshSubscription: Subscription;
  private rotateRefreshButtonSubscription: Subscription;


  constructor(private headerBarService: HeaderBarService) { }

  syncClass = '';

  @Output()
  sidebarTooggle = new EventEmitter();

  @Output()
  searchToggle = new EventEmitter();


  ngOnInit(): void {
      this.subscription = this.headerBarService.currentConfiguration.subscribe( (conf) => {
          this.config = conf;
        }
      );
      this.rotateRefreshButtonSubscription = this.headerBarService.rotateRefreshButton.subscribe( () => this.blinkSync());

      this.refreshSubscription = this.headerBarService.refreshingEnabled.subscribe((value) => {
        this.refreshActive = value;
      });
  }

  private blinkSync() {
    this.syncClass = 'sync';
    setTimeout( () => this.syncClass = '', 1000);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.refreshSubscription.unsubscribe();
    this.rotateRefreshButtonSubscription.unsubscribe();
  }

  onToggle() {
    this.sidebarTooggle.emit();
  }

  onSearchToggle() {
    this.searchToggle.emit();
  }

  onEnableRefresh() {
    this.headerBarService.refreshingEnabled.next(true);
  }

  onDisableRefresh() {
    this.headerBarService.refreshingEnabled.next(false);
  }
}
