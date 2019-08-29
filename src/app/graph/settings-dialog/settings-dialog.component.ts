import { Component, OnInit } from '@angular/core';
import {Form, FormControl, FormGroup} from '@angular/forms';

@Component({
  selector: 'app-settings-dialog',
  templateUrl: './settings-dialog.component.html',
  styleUrls: ['./settings-dialog.component.css']
})
export class SettingsDialogComponent implements OnInit {

  error: Error;
  formGroup = new FormGroup ({
    minRssi: new FormControl(),
    maxLinkAgeSeconds: new FormControl(),
    showUnnamedNodes: new FormControl(),
    showOfflineLastContact: new FormControl()
});


  constructor() { }

  ngOnInit() {
  }

}
