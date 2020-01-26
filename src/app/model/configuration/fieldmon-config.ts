import {D3Node, FixedNode} from 'src/app/graph/d3-widget/d3-widget.component';

export interface FieldmonConfig {
  backgroundImage?: string;
  fixedNodes?: FixedNode[];
  minRssi?: number;
  maxLinkAgeSeconds?: number;
}
