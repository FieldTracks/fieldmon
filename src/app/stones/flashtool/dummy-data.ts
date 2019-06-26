import {StoneConfiguration} from '../../model/StoneConfiguration';
import {from, Observable} from 'rxjs';
import {FlashtoolStatus} from '../../model/flashtool/flashtool-status';

export class DummyData {


  data = [{
    major: '42',
    minor: '1',
    mac: '1e:b3:6e:72:19:46',
    comment: 'Erster Stein',
    version: '77515c8',
    outdated: false,
    wrong_network: false,
    unknown_software: false,
    writing: false
  }, {
    major: '42',
    minor: '2',
    mac: '2e:b3:6e:72:19:46',
    comment: 'Zweiter Stein - outdated',
    version: 'aaaa5c8',
    outdated: true,
    wrong_network: false,
    unknown_software: false,
    writing: false
  }, {
    major: '42',
    minor: '3',
    mac: '3e:b3:6e:72:19:46',
    comment: 'Dritter Stein - flasches Netzwerk',
    version: '77515c8',
    outdated: false,
    wrong_network: true,
    unknown_software: false,
    writing: false
  }, {
    uuid: '',
    major: '',
    minor: '',
    mac: '4e:b3:6e:72:19:46',
    comment: 'Vierter Stein - unbekannte Software',
    version: '',
    outdated: false,
    wrong_network: false,
    unknown_software: true,
    writing: false
  }, {
    major: '42',
    minor: '5',
    mac: '5e:b3:6e:72:19:46',
    comment: 'Fuenfter Stein - wird gerade flashed',
    version: '77515c8',
    outdated: false,
    wrong_network: false,
    unknown_software: false,
    writing: true,
  }];

  public flashToolSubject(): Observable<FlashtoolStatus> {
    const status: FlashtoolStatus[] = [];
    this.data.forEach( (sc) => {
      const current = new DummyFlashToolStatus();
      current.event = 'connected';
      current.stone = sc;
      status.push(current);
    });
    return from(status);
  }

}
export class DummyFlashToolStatus implements FlashtoolStatus {
  event: 'connected' | 'disconnected';
  stone: StoneConfiguration;
}




