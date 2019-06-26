import {StoneConfiguration} from '../StoneConfiguration';

export interface FlashtoolStatus {
  event: 'connected' | 'disconnected';
  stone: StoneConfiguration;
}
