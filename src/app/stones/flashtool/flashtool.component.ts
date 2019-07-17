import {Component, OnDestroy, OnInit} from '@angular/core';
import {StoneConfiguration} from '../../model/StoneConfiguration';
import {MqttAdapterService} from '../../mqtt-adapter.service';
import {FlashtoolModel} from './flashtool.model';
import {Subscription} from 'rxjs';
import {DummyData} from './dummy-data';

@Component({
  selector: 'app-flashtool',
  templateUrl: './flashtool.component.html',
  styleUrls: ['./flashtool.component.scss']
})
export class FlashtoolComponent implements OnInit, OnDestroy {



  stones: FlashtoolModel[] = [];

  private stoneSubscription: Subscription;

  constructor(private mqttService: MqttAdapterService) { }

  ngOnInit() {

    this.stoneSubscription = this.mqttService.flashToolSubject().subscribe( (status) => {
    // new DummyData().flashToolSubject().subscribe( (status) => {
      // Handle disconnect
      if (status.event === 'disconnected') {
        return this.stones = this.stones.filter( (s) => s.object.mac !== status.stone.mac);
      } else {
       const stone = this.stones.find( (s) =>  s.object.mac === status.stone.mac);
        if (stone) {
          stone.object = status.stone;
          stone.unlockUi();
        } else {
          this.stones.push(new FlashtoolModel(status.stone));
        }
      }
    });



  }


  onSubmit(f) {
    console.log('Form', f);
  }

  ngOnDestroy(): void {
    if (this.stoneSubscription) {
      this.stoneSubscription.unsubscribe();
    }
  }

  public sendConfig(model: FlashtoolModel) {
    model.lockUi();
    this.mqttService.sendInstallConfiguration(model.object);
  }

  public editStone(model: FlashtoolModel) {
    model.edit();
  }

  public installSoftware(model: FlashtoolModel) {
    model.lockUi();
    this.mqttService.sendInstallSoftware(model.object);
  }
}
