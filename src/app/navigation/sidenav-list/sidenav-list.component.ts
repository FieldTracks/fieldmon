import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { MqttAdapterService } from '../../mqtt-adapter.service';
import { Subscription } from 'rxjs';
import {LoginService} from '../../login.service';

@Component({
  selector: 'app-sidenav-list',
  templateUrl: './sidenav-list.component.html',
  styleUrls: ['./sidenav-list.component.css']
})
export class SidenavListComponent implements OnInit, OnDestroy {

  @Output('sidebarTooggle')
  sidebarTooggle = new EventEmitter<void>();

  isAuth: boolean;

  private subscription: Subscription;

  constructor(private loginService: LoginService) { }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  ngOnInit() {
    this.subscription = this.loginService.tokenSubject.subscribe( (loggedIn) => {
      console.log("Is logged in? ",this.loginService.isLoggedIn())
      this.isAuth = this.loginService.isLoggedIn();
    });
  }

  sidenavClose() {
    console.log('Emitting')
    this.sidebarTooggle.emit();
  }

  logout() {
    this.loginService.logout();
    this.sidebarTooggle.emit();
      sessionStorage.removeItem('password');
      sessionStorage.removeItem('username');
  }
}
