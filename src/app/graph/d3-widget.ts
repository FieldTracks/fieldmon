import * as d3 from 'd3';
import {Graph} from '../model/Graph';

export class D3Widget {

  static graph: Graph = new Graph();

  static forceSimulation: any;

  static forceSimulationNodes = [];
  static forceSimulationLinks = [];

  run() {
    const canvas = document.querySelector('canvas');
    const context = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Be careful - the API is fragile!
    const forceSimulation = d3.forceSimulation()
      .force('link', d3.forceLink().id(function (d) {
        return d.id;
      }))
      .force('charge', d3.forceManyBody())
      .force('center', d3.forceCenter(width / 2, height / 2));

    forceSimulation
      .nodes(D3Widget.forceSimulationNodes)
      .on('tick', this.createTicked(context, width, height));

    forceSimulation.force('link').links(D3Widget.forceSimulationLinks);

    // Drag and Drop for shaing the nodes
    d3.select(canvas)
      .call(d3.drag()
        .container(canvas)
        .subject(function () {
          return forceSimulation.find(d3.event.x /*- width / 2*/, d3.event.y /*- height / 2*/);
        })
        .on('start', function () {
          if (!d3.event.active) {
            forceSimulation.alphaTarget(0.3).restart();
          }
          d3.event.subject.fx = d3.event.subject.x;
          d3.event.subject.fy = d3.event.subject.y;
        })
        .on('drag', function () {
          d3.event.subject.fx = d3.event.x;
          d3.event.subject.fy = d3.event.y;
        })
        .on('end', function () {
          if (!d3.event.active) {
            forceSimulation.alphaTarget(0);
          }
          d3.event.subject.fx = null;
          d3.event.subject.fy = null;
        }));
    D3Widget.forceSimulation = forceSimulation;
  }

  /**
   * Tick event handler.
   * Due to binding "this" to d3, we need a factory function returning an ordinary JavaScript function
   * @param myContext
   * @param width
   * @param height
   * @returns {() => void}
   */
  createTicked(myContext, width, height) {
    const drawLink = function (d) {
      myContext.moveTo(d.source.x, d.source.y);
      myContext.lineTo(d.target.x, d.target.y);
    };

    const drawNode = function(d) {
      myContext.moveTo(d.x + 5, d.y);
      myContext.arc(d.x, d.y, 5, 0, 2 * Math.PI);
    }

    return function () {
      myContext.clearRect(0, 0, width, height);

      myContext.beginPath();
      D3Widget.forceSimulationLinks.forEach(drawLink);
      myContext.strokeStyle = '#aaa';
      myContext.stroke();

      myContext.beginPath();
      D3Widget.forceSimulationNodes.forEach(drawNode);
      myContext.fill();
      myContext.strokeStyle = '#fff';
      myContext.stroke();
    };
  }

  /**
   * Updating the graph. Exepecting > 10 messages per second, the widet must called it in sane intervals
   */
  updateGraph(): void {
    D3Widget.forceSimulationLinks = D3Widget.graph.codedLinks();
    D3Widget.forceSimulationNodes = D3Widget.graph.codedNodes();
    const nodes = D3Widget.forceSimulation.nodes(D3Widget.forceSimulationNodes);
    const links = D3Widget.forceSimulation.force('link').links(D3Widget.forceSimulationLinks);
  }
}