/*
This file is part of fieldmon - (C) The Fieldtracks Project

    fieldmon is distributed under the civilian open source license (COSLi).
    Military usage is forbidden.

    You should have received a copy of COLi along with fieldmon.
    If not, please contact info@fieldtracks.org

 */
import { Component, OnInit } from '@angular/core';
import {EventEmitter} from '@angular/core';
import {Output} from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  constructor() { }

  @Output()
  sidebarTooggle = new EventEmitter();

  ngOnInit() {
  }


  onToggle() {
    this.sidebarTooggle.emit();
  }

}
