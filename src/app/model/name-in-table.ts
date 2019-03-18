/*
This file is part of fieldmon - (C) The Fieldtracks Project

    fieldmon is distributed under the civilian open source license (COSLi).
    Military usage is forbidden.

    You should have received a copy of COLi along with fieldmon.
    If not, please contact info@fieldtracks.org

 */
export class NameInTable {


  constructor(public mac: string, public major: number, public minor: number,
              public uuid: string, public comment: string, public name?: string, public interval?: number) {

  }

  id_str(): string {
    if (this.uuid) {
      return `${this.major}, ${this.minor}`;
    }
    return this.mac;
  }

  hardware_str(): string {
   if (this.interval) {
      return 'developer_board';
    } else if (this.uuid) {
      return 'wifi_tethering';
    } else {
      return 'bluetooth';
    }
  }
}
