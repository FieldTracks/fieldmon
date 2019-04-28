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
import {HeaderBarService} from '../../header-bar.service';
import {BehaviorSubject, Subscription} from 'rxjs';
import {HeaderBarConfiguration, MenuItem} from '../../helpers/fm-component';
import {MatMenu} from '@angular/material';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {

  refreshActive: boolean;
  config: HeaderBarConfiguration = {sectionTitle: ''};
  syncClass = '';


  private subscription: Subscription;
  private refreshSubscription: Subscription;
  private rotateRefreshButtonSubscription: Subscription;
  private matMenuSubscription: Subscription;
  private matMenu: any;


  constructor(private headerBarService: HeaderBarService) { }

  menuItems: MenuItem[] = [];

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
    this.matMenuSubscription = this.headerBarService.matMenu.subscribe( (matMenu) => {
      this.matMenu = matMenu;
    });

  }

  private blinkSync() {
    this.syncClass = 'sync';
    setTimeout( () => this.syncClass = '', 1000);
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
    if (this.rotateRefreshButtonSubscription) {
      this.rotateRefreshButtonSubscription.unsubscribe();
    }
    if (this.matMenuSubscription) {
      this.matMenuSubscription.unsubscribe();
    }
  }

  onMenuClick(item: MenuItem) {
    item.onClick();
  }

  onToggle() {
    this.sidebarTooggle.emit();
  }

  onSearchToggle() {
    this.headerBarService.searchEntered.emit('');
    this.searchToggle.emit();
  }

  onEnableRefresh() {
    this.headerBarService.refreshingEnabled.next(true);
  }

  onDisableRefresh() {
    this.headerBarService.refreshingEnabled.next(false);
  }
}
