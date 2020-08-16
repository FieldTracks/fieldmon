import {Component, OnDestroy, OnInit} from '@angular/core';
import {Form, FormControl, FormGroup} from '@angular/forms';
import {ConfigService} from '../../config.service';
import {Subscription} from 'rxjs';
import {FieldmonConfig} from '../../model/configuration/fieldmon-config';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-settings-dialog',
  templateUrl: './settings-dialog.component.html',
  styleUrls: ['./settings-dialog.component.css']
})
export class SettingsDialogComponent implements OnInit, OnDestroy {

  error: Error;

  configSubscription: Subscription;
  fieldmonConfig: FieldmonConfig = {};

  constructor(private configService: ConfigService, private dialogRef: MatDialogRef<SettingsDialogComponent>) { }

  ngOnInit() {
    this.configSubscription = this.configService.currentConfiguration().subscribe((fc) => {
      this.fieldmonConfig = fc;
      }
    );
  }

  ngOnDestroy(): void {
    if (this.configSubscription) {
      this.configSubscription.unsubscribe();
    }
  }

  change(): void {
    this.configService.applyTempConfiguration(this.fieldmonConfig);
  }

  submit(): void {
    this.configService.submitTempConfiguration();
    this.dialogRef.close();
  }

  cancel(): void {
    this.configService.resetTempConfiguration();
    this.dialogRef.close();
  }
}
