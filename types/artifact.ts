export interface ArtifactModel {
  artifactName: string;
  version: string;
  checksum: string;
  size: number;
  buildTimestamp: string;
  sourceCommit: string;
  storageLocation: string;
  signed: boolean;
  SBOMAvailable: boolean;
  containerImage?: string;
  digest?: string;
}
