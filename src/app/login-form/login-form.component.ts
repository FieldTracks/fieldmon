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
import {LoginService} from '../login.service';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.css']
})
export class LoginFormComponent implements OnInit {
  broker: String;

  username: string;
  password: string;

  showSpinner: Boolean;
  private connectionProblem: boolean;


  constructor(private router: Router, private loginService: LoginService, private titleService: HeaderBarService) {
  }

  ngOnInit() {
    this.titleService.currentConfiguration.next({sectionTitle: 'Login'});
    this.showSpinner = false;
  }


  login() {
    this.showSpinner = true;
    this.loginService.login(this.username, this.password).subscribe(
      () => this.router.navigate(['/stone-overview']),
      (e) => {
        console.log('Error: ', e);
        this.connectionProblem = true;
        this.showSpinner = false;
      }
    );
  }

}
