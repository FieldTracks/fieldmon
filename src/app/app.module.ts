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
import { LoginModule } from './login/login.module';
import { AppRoutingModule } from './app-routing.module';
import { LoginFormComponent } from './login-form/login-form.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from './material.module';
import { MqttModule, } from 'ngx-mqtt';
import { MQTT_SERVICE_OPTIONS, MqttAdapterService } from './mqtt-adapter.service';
import { StoneOverviewComponent } from './stone-overview/stone-overview.component';
import { SensorContactsComponent } from './sensor-contacts/sensor-contacts.component';
import { GraphComponent } from './graph/graph.component';
import { HeaderComponent } from './navigation/header/header.component';
import { SidenavListComponent } from './navigation/sidenav-list/sidenav-list.component';
import { FlashtoolComponent } from './stones/flashtool/flashtool.component';
import { OnlineComponent } from './stones/online/online.component';
import { NamesDialogComponent } from './names/names-dialog';
import { NodeInfoComponent } from './graph/nodeinfo';
import {FileUploadDialogComponent} from './graph/file-upload-dialog.component';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {SettingsDialogComponent} from './graph/settings-dialog/settings-dialog.component';
import { D3WidgetComponent } from './graph/d3-widget/d3-widget.component';
import {GraphConfigService} from './graph-config.service';
import {registerLocaleData} from '@angular/common';

import localeDe from '@angular/common/locales/de';
import { DevIconComponent } from './shared/dev-icon/dev-icon.component';
import {AuthInterceptor} from './login.service';

@NgModule({
  declarations: [
    AppComponent,
    LoginFormComponent,
    StoneOverviewComponent,
    SensorContactsComponent,
    GraphComponent,
    NamesComponent,
    HeaderComponent,
    SidenavListComponent,
    FlashtoolComponent,
    OnlineComponent,
    NamesDialogComponent,
    NodeInfoComponent,
    FileUploadDialogComponent,
    SettingsDialogComponent,
    D3WidgetComponent,
    DevIconComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    BrowserAnimationsModule,
    LoginModule,
    AppRoutingModule,
    MaterialModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    MqttModule.forRoot(MQTT_SERVICE_OPTIONS)
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent],
  entryComponents: [NamesDialogComponent, NodeInfoComponent, FileUploadDialogComponent, SettingsDialogComponent]
})
export class AppModule {


 // constructor(mqttService: MqttAdapterService, graphConfigService: GraphConfigService) {
 //   registerLocaleData(localeDe, 'de');

  // }


}
