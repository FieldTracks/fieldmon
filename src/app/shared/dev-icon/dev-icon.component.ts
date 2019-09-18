import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-dev-icon',
  templateUrl: './dev-icon.component.html',
  styleUrls: ['./dev-icon.component.css']
})
export class DevIconComponent implements OnInit {

  constructor() { }

  @Input()
  stone: any;

  ngOnInit() {
  }

  public hardware_str(): string {
    if (!this.stone) {
      return 'bluetooth';
    }
    if (this.stone.interval) {
      return 'developer_board';
    } else if (this.stone.uuid) {
      return 'wifi_tethering';
    } else {
      return 'bluetooth';
    }
  }


}
