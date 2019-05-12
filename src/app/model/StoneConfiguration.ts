export interface StoneConfiguration {
  mac: string;
  major?: string;
  minor?: string;
  comment?: string;
  version?: string;
  outdated?: boolean;
  wrong_network?: boolean;
  unknown_software?: boolean;
  writing?: boolean;
  error?: FlashToolStatusError;
}
export interface FlashToolStatusError {
  type: string;
  details: string;
}
