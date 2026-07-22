export interface SBOMComponent {
  name: string;
  version: string;
  license: string;
  signed: boolean;
  source: string;
}

export interface SBOMModel {
  format: "CycloneDX" | "SPDX" | "unknown";
  components: SBOMComponent[];
  generatedAt: string;
  sourceArtifact: string;
}
