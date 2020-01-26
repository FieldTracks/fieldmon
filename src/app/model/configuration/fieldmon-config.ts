import {D3Node} from 'src/app/graph/d3-widget/d3-widget.component';

export interface FieldmonConfig {
  backgroundImage?: string;
  fixedNodes?: D3Node[];
  minRssi?: number;
  maxLinkAgeSeconds?: number;
}
