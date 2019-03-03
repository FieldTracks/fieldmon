/*
This file is part of fieldmon - (C) The Fieldtracks Project

    fieldmon is distributed under the civilian open source license (COSLi).
    Military usage is forbidden.

    You should have received a copy of COLi along with fieldmon.
    If not, please contact info@fieldtracks.org

 */
export class NameInTable {
  mac: string;
  major: number;
  minor: number;
  uuid: string;
  rssi: number;
  comment: string;
  name?: string;

  constructor(mac: string, major: number, minor: number, uuid: string, rssi: number, comment: string, name?: string) {
    this.mac = mac;
    this.major = major;
    this.minor = minor;
    this.uuid = uuid;
    this.name = name;
    this.rssi = rssi;
    this.comment = comment;
  }
}
