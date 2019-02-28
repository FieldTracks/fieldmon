import { NamesDs } from './../../names/names-ds';
import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { MqttAdapterService } from '../../mqtt-adapter.service';
import { Subscription } from 'rxjs';
import { SensorContactsDs } from 'src/app/sensor-contacts/sensor-contacts-ds';


@Component({
  selector: 'app-sidenav-list',
  templateUrl: './sidenav-list.component.html',
  styleUrls: ['./sidenav-list.component.css']
})
export class SidenavListComponent implements OnInit, OnDestroy {

  @Output('sidebarTooggle')
  sidebarTooggle = new EventEmitter<void>();
  private isAuth: boolean;
  private subscription: Subscription;

  constructor(private mqttService: MqttAdapterService, private names: NamesDs,
    private contacts: SensorContactsDs) { }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  ngOnInit() {
    this.subscription = this.mqttService.authChange.subscribe( (loggedIn) => {
      this.isAuth = loggedIn;
    });
  }

  sidenavClose() {
    console.log('Emitting')
    this.sidebarTooggle.emit();
  }

  logout() {
      this.mqttService.logout();
      this.sidebarTooggle.emit();
      this.names.disconnect(null);
      this.contacts.disconnect(null);
      sessionStorage.removeItem('password');
      sessionStorage.removeItem('username');
  }
}
