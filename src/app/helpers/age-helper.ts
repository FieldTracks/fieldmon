/*
This file is part of fieldmon - (C) The Fieldtracks Project

    fieldmon is distributed under the civilian open source license (COSLi).
    Military usage is forbidden.

    You should have received a copy of COLi along with fieldmon.
    If not, please contact info@fieldtracks.org

 */
export function ageC(timeStr: string): string {
  const now = new Date().getTime();
  const before = new Date(timeStr).getTime();
  let dist = Math.floor((now - before) / 1000);

  const seconds = dist % 60;
  dist = Math.floor(dist / 60);
  const minutes = dist % 60;
  dist = Math.floor(dist / 60);

  const secondStr = `${seconds}s`;
  const minuteStr = (minutes > 0) ? `${minutes}m ` : '';
  const hourStr = (dist > 0) ? `${dist}h ` : '';

  return hourStr + minuteStr + secondStr;
}
