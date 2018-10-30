import { NamesComponent } from './names/names.component';
/*
This file is part of fieldmon - (C) The Fieldtracks Project

    fieldmon is distributed under the civilian open source license (COSLi).
    Military usage is forbidden.

    You should have received a copy of COLi along with fieldmon.
    If not, please contact info@fieldtracks.org

 */
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import {LoginModule} from './login/login.module';
import {AppRoutingModule} from './app-routing.module';
import { LoginFormComponent} from './login-form/login-form.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { MaterialModule} from './material.module';
import { NavComponent } from './nav/nav.component';
import { MqttModule, } from 'ngx-mqtt';
import {MQTT_SERVICE_OPTIONS, MqttAdapterService} from './mqtt-adapter.service';
import { StoneOverviewComponent } from './stone-overview/stone-overview.component';
import { SensorContactsComponent } from './sensor-contacts/sensor-contacts.component';
import { GraphComponent } from './graph/graph.component';


@NgModule({
  declarations: [
    AppComponent,
    LoginFormComponent,
    NavComponent,
    StoneOverviewComponent,
    SensorContactsComponent,
    GraphComponent,
    NamesComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    BrowserAnimationsModule,
    LoginModule,
    AppRoutingModule,
    MaterialModule,
    MqttModule.forRoot(MQTT_SERVICE_OPTIONS)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {

  constructor(mqttService: MqttAdapterService) {

  }


}
