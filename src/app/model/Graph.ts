/*
This file is part of fieldmon - (C) The Fieldtracks Project

    fieldmon is distributed under the civilian open source license (COSLi).
    Military usage is forbidden.

    You should have received a copy of COLi along with fieldmon.
    If not, please contact info@fieldtracks.org

 */
import {ageC} from '../helpers/age-helper';
import {StoneEvent} from './StoneEvent';

export class GraphNode {
  id: string;
  uuid: string;
  major: string;
  minor: string;
  lastseen: string;
  links: GraphLink[] = [];
  comment: string;

  constructor(id: string, uuid: string, major: string, minor: string, lastseen: string, comment: string) {
    this.id = id;
    this.uuid = uuid;
    this.major = major;
    this.minor = minor;
    this.lastseen = lastseen;
    this.comment = comment;
  }

  isOffline(): boolean {
    return (new Date().getTime() - this.lastseenDate.getTime()) / 1000 / 60 > 10; // Offline: Not seen for 5 minutes
  }

  age(): string {
    return ageC(this.lastseen);
  }

  get lastseenDate(): Date {
    return new Date(this.lastseenDate);
  }
}
export class GraphLink {
  start: GraphNode;
  end: GraphNode;
  lastseen: string;

  forwardRssi: number;
  reverseRssi: number;

  age(): string {
    return ageC(this.lastseen);
  }

  rssi(): number {
    let unscaled;
    if (this.forwardRssi && this.reverseRssi) {
      unscaled = (this.forwardRssi + this.reverseRssi) / 2;
    } else if (this.forwardRssi) {
      unscaled = this.forwardRssi;
    } else if (this.reverseRssi) {
      unscaled = this.reverseRssi;
    }
    return unscaled + 200; // Linear shift to positiv range
  }

  isObsolete(): boolean {
    return (new Date().getTime() - this.lastseenDate.getTime()) / 1000 / 60 > 10; // Offline: Not seen for 5 minutes
  }

  get lastseenDate(): Date {
    return new Date(this.lastseenDate);
  }

  constructor(start: GraphNode, end: GraphNode, forwardRssi: number) {
    this.start = start;
    this.end = end;
    this.forwardRssi = forwardRssi;
  }
}
export class Graph {
  nodes: GraphNode [] = [];
  links: GraphLink [] = [];

  codedLinks() {
      return this.links.map((link) => {
        return {  source: link.start.id,
                  target: link.end.id,
                  value: link.rssi()};
      });
    }

    codedNodes() {
      return this.nodes.map( (node ) => {
        return {
          id: node.id,
          group: 1
        };
      });
    }

  /**
   * Update the graph based with all data in a stone event.
   * @param {StoneEvent} sE
   */
  addOrUdpateGraph(sE: StoneEvent) {
    // Adding sensor-Node Or update last seen
    const sensorNode = this.addOrUpdateNode(sE.uuid, sE.major, sE.minor, sE.timestmp, sE.comment);

    // Go through observations
    for (const obs of sE.data) {
      const subjectId = this.nodeId(obs.uuid, obs.major, obs.minor);

      // Update node
      const subjectNode = this.addOrUpdateNode(obs.uuid, obs.major, obs.minor, sE.timestmp, null);

      // Update link
      this.addOrUpdateLink(sensorNode, subjectNode, obs.avg, sE.timestmp);
    }
  }

  /**
   * Update Node-Information for
   * @param {string} nodeId
   * @param {string} comment
   * @param {StoneEvent} sE
   */
  private addOrUpdateNode(uuid: string, major: string, minor: string, timestmp, comment: string): GraphNode {
    const nodeId = this.nodeId(uuid, major, minor);
    let index = 0;
    let node: GraphNode = null;
    for (; index < this.nodes.length; index++) {
      node = this.nodes[index];
      if (node.id === nodeId ) {
        break;
      }
    }
    if (node) {
      node.lastseen = timestmp;
      if (comment) {
        node.comment = comment; // Update comment, if node was added as a subject firsts
      }
    } else {
      node = new GraphNode(nodeId, uuid, major, minor, timestmp, comment);
      this.nodes.push(node);
    }
    return node;
  }

  /**
   * Generate an id per node - containing the uuid, major and minor values
   * @param {string} uuid
   * @param {string} major
   * @param {string} minor
   * @returns {string}
   */
  private nodeId(uuid: string, major: string, minor: string): string {
   return `${uuid}-${major}-${minor}`;
  }

  /**
   * Update information on a certain link
   * @param {GraphNode} sensor
   * @param {GraphNode} subject
   * @param {number} rssi
   * @param {string} lastSeen
   * @returns {GraphLink}
   */
  private addOrUpdateLink(sensor: GraphNode, subject: GraphNode, rssi: number, lastSeen: string): GraphLink {
    // Look, if the link exists
    let link = null;
    for (const testLink of this.links) {
      if (testLink.start.id === subject.id) { // Forward link found
        testLink.forwardRssi = rssi;
        link = testLink;
        break;
      } else if (testLink.end.id === subject.id) {
        testLink.reverseRssi = rssi;
        link = testLink;
        break;
      }
    }
    if (link === null) {
      link = new GraphLink(sensor, subject, rssi);
      this.links.push(link);
    }
    link.lastseen = lastSeen;
    return link;
  }
}
