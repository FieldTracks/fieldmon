import {StoneConfiguration} from '../../model/StoneConfiguration';

export class FlashtoolModel {

  private uiEditing: boolean; // UI is in edit state - due to manual switching or since no configuration has been set
  private uiLocked: boolean; // UI i s in locked state, due to a write operation

  public warningText(): ErrorDisplayMessage {
    if (!this.object) {
      return null;
    } else if (this.object.error) {
      return {content: this.object.error.type, tooltip: this.object.error.details};
    } else if (this.object.writing) {
      return null;
    } else if (this.object.unknown_software) {
      return {content: 'Unknown software' };
    } else if (this.object.wrong_network) {
      return {content: 'Wrong network'};
    }
    return null;
  }

  constructor(public object: StoneConfiguration) {
    this.uiEditing = object.unknown_software || object.wrong_network;
    this.uiLocked = object.writing;
  }

  public edit() {
    this.uiEditing = true;
    this.uiLocked = false;
  }

  public lockUi() {
    this.uiLocked = true;
    this.uiEditing = false;
  }

  public unlockUi() {
    this.uiLocked = false;
  }

  public editButtonVisible(): boolean { // Show edit button, if the ui has an object and its not in editing state
    return this.object && !this.uiEditing && !this.object.writing;
  }

  public sendButtonVisible(): boolean {
    return this.object && !this.object.unknown_software && this.uiEditing && !this.object.writing
  }

  /**
   * A device can be flashed, of its outdated or unknown
   * It cannot be flashed if it belongs to a different network
   */
  public flashButtonVisible(): boolean {
    return this.object && (this.object.unknown_software || this.object.outdated || this.object.error ) && !this.object.writing;
  }


  public showForm(): boolean {
    return this.object && !this.object.writing;
  }

  public showSpinner(): boolean {
    return this.object && this.object.writing;
  }

  public showVersion(): boolean {
    return this.object && !this.object.wrong_network && !this.object.unknown_software && !this.object.writing;
  }

  public showUnknownSoftwareWarning(): boolean {
    return this.object && this.object.unknown_software;
  }
}
export interface ErrorDisplayMessage {
  content: string;
  tooltip?: string;
}
