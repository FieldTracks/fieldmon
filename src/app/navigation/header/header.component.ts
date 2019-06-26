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
import {BehaviorSubject, Subject, Subscription} from 'rxjs';
import {HeaderBarConfiguration, MenuItem} from '../../helpers/fm-component';
import { MatMenu } from '@angular/material/menu';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {

  syncClass = '';

  private rotateRefreshButtonSubscription: Subscription;
  private matMenuSubscription: Subscription;
  matMenu: any;

  constructor(private headerBarService: HeaderBarService) { }

  headerBarConfiguration: Subject<HeaderBarConfiguration>;
  refreshingEnabled: Subject<boolean>;
  matMenuTest: Subject<MatMenu>;

  @Output()
  sidebarTooggle = new EventEmitter();

  @Output()
  searchToggle = new EventEmitter();


  ngOnInit(): void {
    this.headerBarConfiguration = this.headerBarService.currentConfiguration;
    this.rotateRefreshButtonSubscription = this.headerBarService.rotateRefreshButton.subscribe( () => this.blinkSync());
    this.refreshingEnabled = this.headerBarService.refreshingEnabled;
    this.matMenuSubscription = this.headerBarService.matMenu.subscribe( (matMenu) => {
      this.matMenu = matMenu;
    });

  }

  private blinkSync() {
    this.syncClass = 'sync';
    setTimeout( () => this.syncClass = '', 1000);
  }

  ngOnDestroy(): void {
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
