/*
This file is part of fieldmon - (C) The Fieldtracks Project

    fieldmon is distributed under the civilian open source license (COSLi).
    Military usage is forbidden.

    You should have received a copy of COLi along with fieldmon.
    If not, please contact info@fieldtracks.org

 */
export class Observation {
  min: number;
  max: number;
  avg: number;
  remoteRssi: number;
  major: string;
  minor: string;
  uuid: string;

}

export class StoneEvent {
  comment: string;
  uuid: string;
  major: string;
  minor: string;
  timestmp: string;
  data: Observation [];
}

