/*
This file is part of fieldmon - (C) The Fieldtracks Project

    fieldmon is distributed under the civilian open source license (COSLi).
    Military usage is forbidden.

    You should have received a copy of COLi along with fieldmon.
    If not, please contact info@fieldtracks.org

 */
import { Component, OnInit, OnDestroy } from '@angular/core';
import {HeaderBarService} from '../header-bar.service';
import {FmComponent, HeaderBarConfiguration} from '../helpers/fm-component';


@Component({
  selector: 'app-stone-overview',
  templateUrl: './stone-overview.component.html',
  styleUrls: ['./stone-overview.component.css']
})
export class StoneOverviewComponent implements OnInit, FmComponent {

  constructor(private titleService: HeaderBarService) { }

  ngOnInit() {
    this.titleService.currentConfiguration.next({sectionTitle: 'Stones'});
  }

  fmHeader(): HeaderBarConfiguration {
    return {sectionTitle: 'Stones'};
  }

}

