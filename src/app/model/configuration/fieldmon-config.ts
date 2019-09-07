import { D3Node } from "src/app/graph/graph.model";

export interface FieldmonConfig {
  backgroundImage?: string;
  fixedNodes?: D3Node[];
  minRssi?: number;
  maxLinkAgeSeconds?: number;
}
