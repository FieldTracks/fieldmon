/*
This file is part of fieldmon - (C) The Fieldtracks Project

    fieldmon is distributed under the civilian open source license (COSLi).
    Military usage is forbidden.

    You should have received a copy of COLi along with fieldmon.
    If not, please contact info@fieldtracks.org

 */
import {ageC} from '../helpers/age-helper';

export class SensorContactTable {
  subject: string;
  stone: string;
  rssi: string;
  timestamp: Date;

  constructor(public mac: string, public observer: string) {

  }



  get age() {
    return ageC('' + this.timestamp);

  }
}
