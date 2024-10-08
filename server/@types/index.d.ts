export type DependencyList = {
  helm: string[]
  circleci: string[]
}

export type MoJSelectDataItem = {
  value: string
  text: string
  selected: boolean
}

export type TrivyVulnerability = {
  PrimaryURL: string
  Title: string
  VulnerabilityID: string
  Severity: string
  References: string[]
}

export type TrivyResult = {
  Vulnerabilities: TrivyVulnerability[]
}

export type TrivyScanResults = {
  Results: TrivyResult[]
}

export type TrivyDisplayEntry = {
  name: string
  title: string
  lastScan: string
  vulnerability: string
  severity: string
  references: string
  primaryUrl: string
}

export type RdsEntry = {
  tf_label: string
  namespace: string
  db_instance_class: string
  db_engine_version: string
  rds_family: string
  db_max_allocated_storage: string
}
