/*
This file is part of fieldmon - (C) The Fieldtracks Project

    fieldmon is distributed under the civilian open source license (COSLi).
    Military usage is forbidden.

    You should have received a copy of COLi along with fieldmon.
    If not, please contact info@fieldtracks.org

 */
import {Component, OnDestroy, OnInit} from '@angular/core';

import {MqttAdapterService} from '../mqtt-adapter.service';
import {environment} from '../../environments/environment';
import {Router} from '@angular/router';
import {BehaviorSubject, Subscription} from 'rxjs';
import {MqttConnectionState} from 'ngx-mqtt';
import {HeaderBarService} from '../header-bar.service';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.css']
})
export class LoginFormComponent implements OnInit, OnDestroy {
  broker: String;

  username: string;
  password: string;

  showSpinner: Boolean;
  private subs: Subscription;
  private connectionProblem: boolean;


  constructor(private router: Router, private mqttService: MqttAdapterService, private titleService: HeaderBarService) {
  }

  ngOnInit() {
    this.titleService.currentConfiguration.next({sectionTitle: 'Login'});
    this.broker = environment.mqtt_broker;
    this.showSpinner = false;
  }

  ngOnDestroy(): void {
    this.unsubscribe();
  }

  login() {
    this.showSpinner = true;
    const subj = this.mqttService.login(this.username, this.password);
    this.subs = subj.subscribe( (state) => {
      if (state === MqttConnectionState.CLOSED) {
        this.showSpinner = false;
        this.connectionProblem = true;
        this.unsubscribe();
      } else if (state === MqttConnectionState.CONNECTING) {
        this.showSpinner = true;
        this.connectionProblem = false;
      } else if (state === MqttConnectionState.CONNECTED) {
        this.router.navigateByUrl('/stone-overview');
        this.unsubscribe();
      }
    });
  }

  private unsubscribe() {
    if (this.subs) {
      this.subs.unsubscribe();
    }
  }
}
