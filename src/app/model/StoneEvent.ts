/*
This file is part of fieldmon - (C) The Fieldtracks Project

    fieldmon is distributed under the civilian open source license (COSLi).
    Military usage is forbidden.

    You should have received a copy of COLi along with fieldmon.
    If not, please contact info@fieldtracks.org

 */
export interface Observation {
  min: number;
  max: number;
  avg: number;
  remoteRssi: number;
  major: number;
  minor: number;
  uuid: string;
  mac: string;

}


export interface StoneEvent {
  comment: string;
  uuid: string;
  major: number;
  minor: number;
  timestamp: Date;
  interval: number;
  data: Observation [];
  mac: string;

}

export function stoneId(se: StoneEvent) {
  return `${se.uuid}-${se.major}-${se.minor}`;
}
