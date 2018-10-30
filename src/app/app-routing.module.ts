/*
This file is part of fieldmon - (C) The Fieldtracks Project

    fieldmon is distributed under the civilian open source license (COSLi).
    Military usage is forbidden.

    You should have received a copy of COLi along with fieldmon.
    If not, please contact info@fieldtracks.org

 */
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {LoginFormComponent} from './login-form/login-form.component';
import {StoneOverviewComponent} from './stone-overview/stone-overview.component';
import {SensorContactsComponent} from './sensor-contacts/sensor-contacts.component';
import {GraphComponent} from './graph/graph.component';
import { NamesComponent } from './names/names.component';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginFormComponent },
  { path: 'stone-overview', component: StoneOverviewComponent },
  { path: 'sensor-contacts', component: SensorContactsComponent },
  { path: 'graph', component: GraphComponent },
  { path: 'names', component: NamesComponent }
];


@NgModule({
  exports: [ RouterModule ],
  imports: [ RouterModule.forRoot(routes) ],
})
export class AppRoutingModule { }
