import { Component, Inject } from "@angular/core";
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from "@angular/material/bottom-sheet";

// [style.width.px]="this.data.width * 0.8"

@Component({
  templateUrl: 'nodeinfo.html',
})
export class NodeInfoComponent {
  constructor(private bottomSheetRef: MatBottomSheetRef<NodeInfoComponent>, @Inject(MAT_BOTTOM_SHEET_DATA) public data: any) { }

  toggel() {
    if (this.data.node.fx || this.data.node.fy) {
      this.data.node.fx = undefined;
      this.data.node.fy = undefined;
      this.data.node.fixed = false;
    } else {
      this.data.node.fx = this.data.node.x;
      this.data.node.fy = this.data.node.y;
      this.data.node.fixed = true;
    }
    this.data.graph.manualPositionChange.next(this.data.node);
  }
}
