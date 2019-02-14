/*
This file is part of fieldmon - (C) The Fieldtracks Project

    fieldmon is distributed under the civilian open source license (COSLi).
    Military usage is forbidden.

    You should have received a copy of COLi along with fieldmon.
    If not, please contact info@fieldtracks.org

 */
import {ageC} from '../helpers/age-helper';

export class Names {
  Major: string;
  Minor: string;
  Mac: string;
  RSSI: number;
  Name: string;
  UUID: String;
  Color: string;
  Comment: string;
  ShowEditnameField: boolean;

  timestmp: string;

  get age() {
    return ageC(this.timestmp);
  }
}
