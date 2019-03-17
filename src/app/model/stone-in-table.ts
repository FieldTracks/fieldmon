/*
This file is part of fieldmon - (C) The Fieldtracks Project

    fieldmon is distributed under the civilian open source license (COSLi).
    Military usage is forbidden.

    You should have received a copy of COLi along with fieldmon.
    If not, please contact info@fieldtracks.org

 */
import {ageC} from '../helpers/age-helper';


export class StoneInTable {
  comment: string;
  private name: string;

  constructor(comment: string, uuid: string, major: number, minor: number, lastSeen: Date, name: string) {
    this.comment = comment;
    this.uuid = uuid;
    this.major = major;
    this.minor = minor;
    this.lastSeen = lastSeen;
    this.name = name;
  }


  uuid: String;
  major: number;
  minor: number;
  lastSeen: Date;

  get age() {
    return ageC(this.lastSeen.toISOString());
  }
}
