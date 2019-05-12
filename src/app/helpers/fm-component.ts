export interface HeaderBarConfiguration {
  sectionTitle: string;
  showSearch?: boolean;
  showRefresh?: boolean;
}


export interface FmComponent {
  fmHeader(): HeaderBarConfiguration;
  fmMenuItems?(): MenuItem[];
}

export interface MenuItem {
  name: string;
  icon: string;
  onClick();
}
