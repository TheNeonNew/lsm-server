export interface Migration {
  name: string;
  version: number;
  up: () => void;
  down: () => void;
}

export interface MigrationRecord {
  id?: number;
  name: string;
  version: number;
  appliedAt: string;
}
