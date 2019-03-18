export interface HeaderBarConfiguration {
  sectionTitle: string;
  showSearch?: boolean;
  showRefresh?: boolean;
}

export interface HeaderAware {
  fieldmonHeader(): HeaderBarConfiguration;
}

