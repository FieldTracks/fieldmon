import {StoneConfiguration} from './StoneConfiguration';

export interface FlashtoolStatus {
  event: 'connected' | 'disconnected';
  stoneConfiguration: StoneConfiguration;
}
