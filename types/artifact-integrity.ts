export interface ArtifactIntegrityResult {
  checksumValid: boolean;
  signatureValid: boolean;
  tamperingDetected: boolean;
  provenanceValid: boolean;
}
