/*
This file is part of fieldmon - (C) The Fieldtracks Project

    fieldmon is distributed under the civilian open source license (COSLi).
    Military usage is forbidden.

    You should have received a copy of COLi along with fieldmon.
    If not, please contact info@fieldtracks.org

 */
import { Component, OnInit } from '@angular/core';
import {MatFormField, MatFormFieldControl, MatCardTitle} from '@angular/material';

import {MqttAdapterService} from '../mqtt-adapter.service';
import {environment} from '../../environments/environment';
import {Router} from '@angular/router';

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

  constructor(private router: Router, private adapter: MqttAdapterService) {

  }
  ngOnInit() {
    this.broker = environment.mqtt_broker;
    this.showSpinner = false;
  }

  login() {
    this.showSpinner = true;
    this.adapter.subscribeLogin(this.username, this.password);
    this.router.navigateByUrl('/stone-overview');
  }
}
