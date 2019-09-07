import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable, Subscription} from 'rxjs';
import {FieldmonConfig} from './model/configuration/fieldmon-config';
import {MqttAdapterService} from './mqtt-adapter.service';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  private _authorativeConfiguration: FieldmonConfig; // Configuration valid in the complete network as given by mqtt broker
  private _currentConfiguration = new BehaviorSubject<FieldmonConfig>({}); // Current configuration applied locally (e.g. for generating previews)

  private _tempConfiguration: FieldmonConfig; // Temporary Configuration used for preview


  constructor(private mqttadapter: MqttAdapterService) {
    mqttadapter.fieldmonSubject().subscribe(
      (fc: FieldmonConfig) => {
        this.applyRemoteConfiguration(fc);
      }
    );
  }

  /**
   * Observable to be used by all components needing configuration data
    */
  currentConfiguration(): Observable<FieldmonConfig> {
    return this._currentConfiguration.asObservable();
  }

  /**
   * Reset all temporary configuration; revert to authoritative state
   */
  resetTempConfiguration(): void {
    this._currentConfiguration.next(this._authorativeConfiguration);
    this._tempConfiguration = null;
  }

  /**
   * Apply given configuration to all components in the app
   * @param fc
   */
  applyTempConfiguration(fc: FieldmonConfig): void {
    this._tempConfiguration = fc;
    this._currentConfiguration.next(fc);
  }

  /**
   * Submit a temporary configuration to the network (mqtt) and make it authorititve
   */
  submitTempConfiguration(): void {
    if (this._tempConfiguration != null) {
      this.mqttadapter.publishFieldmonConfig(this._tempConfiguration);
    }
  }

  /**
   * Submit a new configuration, that is not used for preview
   */
  submitConfiguration(fieldmonConfig: FieldmonConfig): void {
    this.mqttadapter.publishFieldmonConfig(fieldmonConfig);
  }
  /**
   * Private helper: Apply a newly received remote configuration
   * @param rConfig
   */
  private applyRemoteConfiguration(rConfig: FieldmonConfig): void {
    this._authorativeConfiguration = rConfig;
    this.resetTempConfiguration();
  }
}
